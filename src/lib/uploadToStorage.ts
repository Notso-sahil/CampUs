import imageCompression from "browser-image-compression";
import { auth } from "./firebase";
import { compressPdf } from "./compressPdf";

const getFileHash = (file: File): Promise<{ hash: string; firstBytesHex: string }> => {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('./hashWorker.ts', import.meta.url), { type: 'module' });
    
    worker.onmessage = (e) => {
      if (e.data.success) {
        resolve({ hash: e.data.hash, firstBytesHex: e.data.firstBytesHex });
      } else {
        reject(new Error(e.data.error));
      }
      worker.terminate();
    };
    
    worker.onerror = (err) => {
      reject(err);
      worker.terminate();
    };
    
    worker.postMessage(file);
  });
};

export async function uploadToStorage(
  file: File,
  folder: string
): Promise<string> {
  let processedFile = file;

  // Phase 0 & 1: Compression
  if (file.type.startsWith("image/")) {
    const options = {
      maxSizeMB: 5,
      maxWidthOrHeight: 2000,
      useWebWorker: true,
      fileType: "image/jpeg",
    };
    try {
      processedFile = await imageCompression(file, options);
    } catch (error) {
      console.error("Image compression error:", error);
    }
  } else if (file.type === "application/pdf" && file.size > 1024 * 1024) {
    // Compress PDF if larger than 1MB
    processedFile = await compressPdf(file);
  }

  // Phase 1: Hashing for Deduplication
  const { hash, firstBytesHex } = await getFileHash(processedFile);

  // 1. Get Firebase ID token
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error("Must be logged in to upload files.");
  }
  const token = await currentUser.getIdToken();

  // 2. Request a presigned URL from our backend (Deduplication Check)
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/get-upload-url`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      filename: processedFile.name || "upload.jpg",
      folder: folder,
      contentType: processedFile.type,
      size: processedFile.size,
      hash,
      firstBytesHex
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || "Failed to get upload URL");
  }

  const { alreadyExists, uploadUrl, publicUrl } = await response.json();

  // 3. Fast-path: The file already exists on the server!
  if (alreadyExists) {
    console.log("File already exists on the server. Skipping upload.");
    // We still need to record ownership for the user
    await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/finalize-upload`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ hash, originalFilename: processedFile.name })
    });
    return publicUrl;
  }

  // 4. Upload the new file directly to Cloudflare R2
  const uploadRes = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": processedFile.type,
    },
    body: processedFile,
  });

  if (!uploadRes.ok) {
    throw new Error("Failed to upload file to storage.");
  }

  // 5. Finalize the upload to link ownership and increment reference count
  const finalizeRes = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/finalize-upload`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ hash, originalFilename: processedFile.name })
  });

  if (!finalizeRes.ok) {
    console.error("Failed to finalize upload link, but file was uploaded.");
  }

  return publicUrl;
}