self.onmessage = async (e: MessageEvent) => {
  const file: File = e.data;
  
  try {
    // We only need the first 4KB for proof of possession
    const firstBytesChunk = file.slice(0, 4096);
    const firstBytesBuffer = await firstBytesChunk.arrayBuffer();
    
    // Convert first bytes to hex
    const hashArray = Array.from(new Uint8Array(firstBytesBuffer));
    const firstBytesHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Compute full SHA-256 hash
    // We process it in one go here for simplicity since the max size is 30MB
    // which fits easily in browser memory.
    const fullBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', fullBuffer);
    
    const hashHexArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashHexArray.map(b => b.toString(16).padStart(2, '0')).join('');

    self.postMessage({ success: true, hash: hashHex, firstBytesHex });
  } catch (error: any) {
    self.postMessage({ success: false, error: error.message });
  }
};
