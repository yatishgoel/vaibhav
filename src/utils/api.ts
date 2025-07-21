import {
  PDFAnalysisResponse,
  PDFAnalysisRequest,
} from "@/entities/LeaseAnalysis";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8001";

interface FileUploadResponse {
  status: "success" | "error";
  message: string;
  filename: string;
  public_url: string;
  original_filename: string;
  file_size: number;
  bucket: string;
}

export class ApiService {
  /**
   * Test API connectivity
   * @returns Promise indicating if API is reachable
   */
  static async testConnection(): Promise<{
    success: boolean;
    message: string;
  }> {
    console.log("🔍 Testing API connection...");
    console.log("🌐 Testing URL:", API_BASE_URL);

    try {
      // Try a simple GET request to see if server is responding
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: "GET",
        headers: {
          accept: "application/json",
        },
      });

      console.log("📨 Health check response status:", response.status);

      if (response.ok) {
        console.log("✅ API server is reachable");
        return { success: true, message: "API server is reachable" };
      } else {
        console.log(
          "⚠️ API server responded but with error status:",
          response.status
        );
        return {
          success: false,
          message: `API server responded with status ${response.status}`,
        };
      }
    } catch (error) {
      console.error("❌ API connection test failed:", error);

      if (error instanceof TypeError && error.message.includes("fetch")) {
        return {
          success: false,
          message: `Cannot connect to API server at ${API_BASE_URL}. Please check if the server is running.`,
        };
      }

      return {
        success: false,
        message: `Connection test failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }
  }

  /**
   * Upload a file to the server
   * @param file The file to upload
   * @returns Promise with the uploaded file URL
   */
  static async uploadFile(file: File): Promise<string> {
    console.log("🚀 Starting file upload...");
    console.log("📁 File details:", {
      name: file.name,
      size: file.size,
      type: file.type,
    });
    console.log("🌐 API URL:", `${API_BASE_URL}/upload-file`);

    const formData = new FormData();
    formData.append("file", file);

    try {
      console.log("📤 Making upload request...");

      const response = await fetch(`${API_BASE_URL}/upload-file`, {
        method: "POST",
        headers: {
          accept: "application/json",
        },
        body: formData,
      });

      console.log("📨 Upload response status:", response.status);
      console.log(
        "📨 Upload response headers:",
        Object.fromEntries(response.headers.entries())
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Upload failed:", {
          status: response.status,
          statusText: response.statusText,
          errorText,
        });
        throw new Error(
          `Upload failed: ${response.status} ${response.statusText} - ${errorText}`
        );
      }

      const data: FileUploadResponse = await response.json();
      console.log("✅ Upload response data:", data);

      if (data.status === "success") {
        console.log(
          "🔗 File uploaded successfully. Public URL:",
          data.public_url
        );
        return data.public_url;
      } else {
        console.error("❌ Upload API returned error:", data.message);
        throw new Error(data.message || "Upload failed");
      }
    } catch (error) {
      console.error("💥 File upload error:", error);

      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error(
          `Network error: Cannot connect to API server at ${API_BASE_URL}. Please check if the server is running and accessible.`
        );
      }

      if (error instanceof Error) {
        throw error;
      }

      throw new Error("Failed to upload file - Unknown error");
    }
  }

  /**
   * Analyze PDF using the uploaded file URL
   * @param pdfUrl The URL of the uploaded PDF
   * @returns Promise with analysis results
   */
  static async analyzePDF(pdfUrl: string): Promise<PDFAnalysisResponse> {
    console.log("🔍 Starting PDF analysis...");
    console.log("🔗 PDF URL:", pdfUrl);
    console.log("🌐 Analysis API URL:", `${API_BASE_URL}/analyze-pdf`);

    try {
      const requestBody: PDFAnalysisRequest = {
        pdf_url: pdfUrl,
      };

      console.log("📤 Making analysis request with body:", requestBody);

      const response = await fetch(`${API_BASE_URL}/analyze-pdf`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      console.log("📨 Analysis response status:", response.status);
      console.log(
        "📨 Analysis response headers:",
        Object.fromEntries(response.headers.entries())
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Analysis failed:", {
          status: response.status,
          statusText: response.statusText,
          errorText,
        });
        throw new Error(
          `Analysis failed: ${response.status} ${response.statusText} - ${errorText}`
        );
      }

      const data: PDFAnalysisResponse = await response.json();
      console.log("✅ Analysis response data:", data);

      if (data.status === "success") {
        console.log(
          "🎉 Analysis completed successfully. Found",
          data.extracted_results.length,
          "results"
        );
        return data;
      } else {
        console.error("❌ Analysis API returned error:", data.message);
        throw new Error(data.message || "Analysis failed");
      }
    } catch (error) {
      console.error("💥 PDF analysis error:", error);

      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error(
          `Network error: Cannot connect to API server at ${API_BASE_URL}. Please check if the server is running and accessible.`
        );
      }

      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to analyze PDF - Unknown error");
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
    console.log("🔄 Starting upload and analyze workflow...");

    try {
      // Step 1: Upload file
      console.log("📤 Step 1: Uploading file...");
      onProgress?.("uploading", "Uploading file to server...");
      const fileUrl = await this.uploadFile(file);

      // Step 2: Analyze PDF
      console.log("🔍 Step 2: Analyzing PDF...");
      onProgress?.("analyzing", "Analyzing PDF content and extracting data...");
      const analysisResult = await this.analyzePDF(fileUrl);

      console.log("🎉 Workflow completed successfully!");
      return analysisResult;
    } catch (error) {
      console.error("💥 Upload and analyze workflow error:", error);
      throw error;
    }
  }
}
