import ghostscript from "@jspawn/ghostscript-wasm";

export async function compressPdf(file: File): Promise<File> {
  // Read the original file into an ArrayBuffer
  const arrayBuffer = await file.arrayBuffer();
  
  // Set up Ghostscript arguments for eBook quality compression (150 DPI)
  // This drastically reduces file size for scanned PDFs while maintaining readability
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

  try {
    // Run ghostscript WASM
    const result = await ghostscript({
      args,
      files: [
        {
          name: "input.pdf",
          data: new Uint8Array(arrayBuffer),
        }
      ]
    });

    // Extract the output file
    const outputFile = result.files.find((f: any) => f.name === "output.pdf");
    
    if (!outputFile) {
      throw new Error("Ghostscript failed to produce output.pdf");
    }

    // Convert back to a File object
    const compressedBlob = new Blob([outputFile.data], { type: "application/pdf" });
    const compressedFile = new File([compressedBlob], file.name, {
      type: "application/pdf",
      lastModified: Date.now(),
    });

    // Fallback: If for some strange reason the "compressed" file is larger,
    // just return the original file to save storage.
    if (compressedFile.size >= file.size) {
      return file;
    }

    return compressedFile;
  } catch (error) {
    console.error("PDF compression failed, falling back to original:", error);
    // Never block upload on compression failure
    return file;
  }
}
