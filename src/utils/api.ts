import {
  PDFAnalysisResponse,
  PDFAnalysisRequest,
} from "@/entities/LeaseAnalysis";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export class ApiService {
  /**
   * Upload a file to the server
   * @param file The file to upload
   * @returns Promise with the uploaded file URL
   */
  static async uploadFile(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${API_BASE_URL}/upload-file`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.file_url || data.url;
    } catch (error) {
      console.error("File upload error:", error);
      throw new Error("Failed to upload file");
    }
  }

  /**
   * Analyze PDF using the uploaded file URL
   * @param pdfUrl The URL of the uploaded PDF
   * @returns Promise with analysis results
   */
  static async analyzePDF(pdfUrl: string): Promise<PDFAnalysisResponse> {
    try {
      const requestBody: PDFAnalysisRequest = {
        pdf_url: pdfUrl,
      };

      const response = await fetch(`${API_BASE_URL}/analyze-pdf`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.statusText}`);
      }

      const data: PDFAnalysisResponse = await response.json();
      return data;
    } catch (error) {
      console.error("PDF analysis error:", error);
      throw new Error("Failed to analyze PDF");
    }
  }

  /**
   * Complete workflow: Upload file and analyze it
   * @param file The file to upload and analyze
   * @param onProgress Optional callback for progress updates
   * @returns Promise with analysis results
   */
  static async uploadAndAnalyze(
    file: File,
    onProgress?: (stage: "uploading" | "analyzing", message: string) => void
  ): Promise<PDFAnalysisResponse> {
    try {
      // Step 1: Upload file
      onProgress?.("uploading", "Uploading file to server...");
      const fileUrl = await this.uploadFile(file);

      // Step 2: Analyze PDF
      onProgress?.("analyzing", "Analyzing PDF content and extracting data...");
      const analysisResult = await this.analyzePDF(fileUrl);

      return analysisResult;
    } catch (error) {
      console.error("Upload and analyze error:", error);
      throw error;
    }
  }
}
