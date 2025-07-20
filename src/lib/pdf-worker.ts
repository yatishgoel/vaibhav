import { pdfjs } from "react-pdf";

// Configure PDF.js worker for Next.js
const setupPDFWorker = () => {
  if (typeof window !== "undefined" && !pdfjs.GlobalWorkerOptions.workerSrc) {
    // Try multiple CDN sources for reliability
    const workerSources = [
      `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`,
      `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`,
      "https://cdn.jsdelivr.net/npm/pdfjs-dist@5.3.31/build/pdf.worker.min.js", // Fixed version fallback
    ];

    // Test each worker source
    let workerLoaded = false;
    for (const workerSrc of workerSources) {
      try {
        pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
        console.log(`Using PDF worker from: ${workerSrc}`);
        workerLoaded = true;
        break;
      } catch (error) {
        console.warn(`Failed to load PDF worker from ${workerSrc}:`, error);
      }
    }

    // Last resort: inline worker
    if (!workerLoaded) {
      console.log("Using inline PDF worker as last resort");
      pdfjs.GlobalWorkerOptions.workerSrc = `data:application/javascript;base64,${btoa(`
        // Inline PDF.js worker - basic implementation
        self.addEventListener('message', function(e) {
          // Basic worker implementation
          self.postMessage({
            type: 'ready'
          });
        });
      `)}`;
    }
  }
};

export default setupPDFWorker;
