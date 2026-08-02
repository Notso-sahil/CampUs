import imageCompression from "browser-image-compression";
import { auth } from "./firebase";
import { api } from "./api";

// We keep the name uploadToCloudinary for backward compatibility, 
// but it now securely uploads to Cloudflare R2 using presigned URLs.
export async function uploadToCloudinary(
  file: File,
  folder: string
): Promise<string> {
  let processedFile = file;

  // Compress images (skip for PDFs or other docs)
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
      console.error("Compression error:", error);
      // Fallback to original file if compression fails
    }
  }

  // 1. Get Firebase ID token
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error("Must be logged in to upload files.");
  }
  const token = await currentUser.getIdToken();

  // 2. Request a presigned URL from our backend
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
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || "Failed to get upload URL");
  }

  const { uploadUrl, publicUrl } = await response.json();

  // 3. Upload the file directly to Cloudflare R2
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

  // 4. Return the public URL for the database
  return publicUrl;
}