export async function compressPdf(file: File): Promise<File> {
  return new Promise(async (resolve) => {
    // We immediately read the ArrayBuffer on the main thread so we can transfer it
    const arrayBuffer = await file.arrayBuffer();
    
    const worker = new Worker(new URL("./pdfWorker.ts", import.meta.url), {
      type: "module",
    });

    worker.onmessage = (e) => {
      const { success, compressedBuffer, error } = e.data;
      
      if (success) {
        const compressedBlob = new Blob([compressedBuffer], { type: "application/pdf" });
        const compressedFile = new File([compressedBlob], file.name, {
          type: "application/pdf",
          lastModified: Date.now(),
        });

        // Fallback: If for some reason compression made it larger, return original
        if (compressedFile.size >= file.size) {
          resolve(file);
        } else {
          resolve(compressedFile);
        }
      } else {
        console.error("PDF compression worker failed, falling back to original:", error);
        resolve(file); // Never block upload on failure
      }
      
      worker.terminate();
    };

    worker.onerror = (err) => {
      console.error("Worker fatal error:", err);
      resolve(file);
      worker.terminate();
    };

    // Transfer ownership of the buffer to the worker (zero-copy)
    worker.postMessage({ fileBuffer: arrayBuffer, filename: file.name }, [arrayBuffer]);
  });
}
