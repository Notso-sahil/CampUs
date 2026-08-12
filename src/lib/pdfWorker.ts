// This worker runs the Ghostscript WASM so we don't freeze the main UI thread during intense PDF compression.
import ghostscript from "@jspawn/ghostscript-wasm";

const WASM_VERSION = "ghostscript-wasm-v0.1.3"; // Update this key when bumping the package version
const WASM_URL = "https://cdn.jsdelivr.net/npm/@jspawn/ghostscript-wasm@0.1.3/dist/ghostscript.wasm";

async function fetchAndCacheWasm(): Promise<string> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("wasm-cache-db", 1);
    
    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains("wasm")) {
        db.createObjectStore("wasm");
      }
    };

    request.onsuccess = (event: any) => {
      const db = event.target.result;
      const tx = db.transaction("wasm", "readonly");
      const store = tx.objectStore("wasm");
      const getRequest = store.get(WASM_VERSION);

      getRequest.onsuccess = async () => {
        if (getRequest.result) {
          // Found in cache! Create an object URL directly from the Blob
          resolve(URL.createObjectURL(getRequest.result));
        } else {
          try {
            // Not in cache, fetch it over the network
            const response = await fetch(WASM_URL);
            if (!response.ok) throw new Error("Failed to fetch WASM binary");
            
            const blob = await response.blob();
            
            // Store it in IndexedDB for next time
            const writeTx = db.transaction("wasm", "readwrite");
            writeTx.objectStore("wasm").put(blob, WASM_VERSION);
            
            resolve(URL.createObjectURL(blob));
          } catch (err) {
            reject(err);
          }
        }
      };
      
      getRequest.onerror = () => reject(getRequest.error);
    };
    
    request.onerror = () => reject(request.error);
  });
}

self.onmessage = async (e) => {
  const { fileBuffer, filename } = e.data;
  
  try {
    const wasmUrl = await fetchAndCacheWasm();

    const args = [
      "-sDEVICE=pdfwrite",
      "-dCompatibilityLevel=1.4",
      "-dPDFSETTINGS=/ebook",
      "-dNOPAUSE",
      "-dQUIET",
      "-dBATCH",
      "-sOutputFile=output.pdf",
      "input.pdf"
    ];

    const result = await ghostscript({
      args,
      files: [
        {
          name: "input.pdf",
          data: new Uint8Array(fileBuffer),
        }
      ],
      locateFile: () => wasmUrl // Emscripten uses this blob URL instead of HTTP request
    });

    const outputFile = result.files.find((f: any) => f.name === "output.pdf");
    
    if (!outputFile) {
      throw new Error("Ghostscript failed to produce output.pdf");
    }

    // Success, return the raw ArrayBuffer to the main thread
    const workerContext = self as unknown as Worker;
    workerContext.postMessage({ success: true, compressedBuffer: outputFile.data.buffer }, [outputFile.data.buffer]);
    
  } catch (error: any) {
    const workerContext = self as unknown as Worker;
    workerContext.postMessage({ success: false, error: error.message });
  }
};
