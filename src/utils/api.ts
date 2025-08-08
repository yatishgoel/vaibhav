import {
  PDFAnalysisResponse,
  PDFAnalysisRequest,
  ExtractedResult,
} from "@/entities/LeaseAnalysis";

// const API_BASE_URL =
//   process.env.NEXT_PUBLIC_API_BASE_URL  || "http://20.195.13.138" || "http://localhost:8000" ; 

const API_BASE_URL =
     "http://localhost:8000" ; 

  
interface FileUploadResponse {
  status: "success" | "error";
  message: string;
  jobExecutionID?: string;
  filename?: string;
  public_url?: string;
  original_filename?: string;
  file_size?: number;
  bucket?: string;
}

interface JobStatusResponse {
  jobID: string;
  status: "IN_PROGRESS" | "SUCCESS" | "FAILURE";
  message?: string;
  extracted_results?: ExtractedResult[];
}

interface LoginRequest {
  username: string;
  password: string;
}

interface LoginResponse {
  status?: string;
  success: boolean;
  message: string;
  userID?: string;
  email?: string;
  name?: string;
  accountID?: string;
  user?: {
    username: string;
    role: string;
  };
}

interface CreateProjectRequest {
  projectName: string;
  userID: string;
}

interface CreateProjectResponse {
  status: "success" | "error";
  message: string;
  projectID?: string;
  projectName?: string;
}

interface GetProjectsRequest {
  userID: string;
}

interface ProjectItem {
  projectID: string;
  projectName: string;
}

interface GetProjectsResponse {
  status: "success" | "error";
  message: string;
  projects?: ProjectItem[];
}

interface FetchProjectRequest {
  projectID: string;
}

interface PDFItem {
  url: string;
  filename: string;
}

interface FetchProjectResponse {
  status: "success" | "error";
  message: string;
  projectID?: string;
  pdf_urls?: string[];
  pdfs?: PDFItem[]; // Keep for backward compatibility
}

interface JobHistoryItem {
  jobExecutionID: string;
  fileName: string;
  jobStatus: "SUCCESS" | "FAILED" | "IN_PROGRESS";
  created_date?: string;
}

interface FetchJobsRequest {
  account_id: string;
}

interface FetchJobsResponse {
  status: "success" | "error";
  message: string;
  jobs?: JobHistoryItem[];
}

interface ExportAnalysisRequest {
  jobExecutionId: string;
  format: "XLSX" | "PDF";
}

interface ExportAnalysisResponse {
  status: "success" | "error";
  jobExecutionID?: string;
  format?: string;
  public_url?: string;
  message?: string;
}

export class ApiService {
  /**
   * Get the base URL for API requests
   * @returns The API base URL
   */
  static getBaseUrl(): string {
    return API_BASE_URL;
  }
  /**
   * Authenticate user with username and password
   * @param username User's username
   * @param password User's password
   * @returns Promise with login response
   */
  static async login(username: string, password: string): Promise<LoginResponse> {
    console.log("🔐 Starting user login...");
    console.log("👤 Username:", username);

    try {
      const requestBody: LoginRequest = {
        username,
        password,
      };

      const response = await fetch(`${API_BASE_URL}/user-login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      console.log("📨 Login response status:", response.status);
      console.log(response.ok);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ Login failed:", {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
        });
        return {
          status: "error",
          success: false,
          message: errorData.message || "Login failed",
        };
      }

      const data: LoginResponse = await response.json();
      console.log("✅ Login successful:", data);
      
      // Store user data in localStorage for profile access
      if (data.userID && data.email && data.name) {
        const userData = {
          id: data.userID,
          email: data.email,
          full_name: data.name,
          accountID: data.accountID,
          role: "user", // Default role, can be updated if backend provides it
        };
        localStorage.setItem("userData", JSON.stringify(userData));
      }
      
      return {
        status: "success",
        success: true,
        message: data.message || "Login successful",
        userID: data.userID,
        email: data.email,
        name: data.name,
        accountID: data.accountID,
        user: data.user,
      };
    } catch (error) {
      console.error("💥 Login error:", error);

      if (error instanceof TypeError && error.message.includes("fetch")) {
        return {
          status: "error",
          success: false,
          message: `Network error: Cannot connect to API server at ${API_BASE_URL}. Please check if the server is running and accessible.`,
        };
      }

      return {
        status: "error",
        success: false,
        message: error instanceof Error ? error.message : "Login failed - Unknown error",
      };
    }
  }

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
  static async uploadFile(file: File, projectId?: string): Promise<{ jobExecutionID: string; public_url?: string }> {
    console.log("🚀 Starting file upload...");
    console.log("📁 File details:", {
      name: file.name,
      size: file.size,
      type: file.type,
    });
    console.log("📁 Project ID:", projectId);
    console.log("🌐 API URL:", `${API_BASE_URL}/upload-file`);

    const formData = new FormData();
    formData.append("file", file);
    if (projectId) {
      formData.append("projectID", projectId);
    }

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
        if (data.jobExecutionID) {
          console.log("🔗 File uploaded successfully. Job ID:", data.jobExecutionID);
          return { jobExecutionID: data.jobExecutionID, public_url: data.public_url };
        } else if (data.public_url) {
          console.log("🔗 File uploaded successfully. Public URL:", data.public_url);
          return { jobExecutionID: "", public_url: data.public_url };
        } else {
          throw new Error("Upload successful but no job ID or public URL returned");
        }
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
   * Check job status
   * @param jobExecutionID The job execution ID to check
   * @returns Promise with job status
   */
  static async checkJobStatus(jobExecutionID: string): Promise<JobStatusResponse> {
    console.log("🔍 Checking job status for:", jobExecutionID);
    
    try {
      const response = await fetch(`${API_BASE_URL}/status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify({ jobExecutionID }),
      });

      console.log("📨 Status response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Status check failed:", {
          status: response.status,
          statusText: response.statusText,
          errorText,
        });
        throw new Error(
          `Status check failed: ${response.status} ${response.statusText} - ${errorText}`
        );
      }

      const data: JobStatusResponse = await response.json();
      console.log("✅ Status response data:", data);
      
      return data;
    } catch (error) {
      console.error("💥 Status check error:", error);
      throw error;
    }
  }

  /**
   * Poll job status until completion
   * @param jobExecutionID The job execution ID to poll
   * @param onProgress Optional callback for progress updates
   * @returns Promise with analysis results
   */
  static async pollJobStatus(
    jobExecutionID: string,
    onProgress?: (stage: "uploading" | "analyzing", message: string) => void
  ): Promise<PDFAnalysisResponse> {
    console.log("🔄 Starting job status polling for:", jobExecutionID);
    
    const maxAttempts = 60; // 5 minutes with 5-second intervals
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      attempts++;
      console.log(`📊 Polling attempt ${attempts}/${maxAttempts}`);
      
      try {
        const statusResponse = await this.checkJobStatus(jobExecutionID);
        
        if (statusResponse.status === "SUCCESS") {
          console.log("✅ Job completed successfully");
          onProgress?.("analyzing", "Analysis completed successfully");
          
          // Extract results from the status response
          const analysisResult: PDFAnalysisResponse = {
            status: "success",
            message: statusResponse.message || "Analysis completed successfully",
            extracted_results: statusResponse.extracted_results || [],
            jobExecutionId: jobExecutionID, // Include the job execution ID
          };
          
          console.log("📊 Analysis results:", analysisResult.extracted_results);
          return analysisResult;
        } else if (statusResponse.status === "FAILURE") {
          console.error("❌ Job failed:", statusResponse.message);
          throw new Error(statusResponse.message || "Analysis failed");
        } else if (statusResponse.status === "IN_PROGRESS") {
          console.log("⏳ Job still in progress...");
          onProgress?.("analyzing", "Processing document...");
          
          // Wait 5 seconds before next poll
          await new Promise(resolve => setTimeout(resolve, 5000));
        } else {
          console.error("❌ Unknown job status:", statusResponse.status);
          throw new Error(`Unknown job status: ${statusResponse.status}`);
        }
      } catch (error) {
        console.error("💥 Error during polling:", error);
        throw error;
      }
    }
    
    throw new Error("Job polling timed out after 5 minutes");
  }

  /**
   * Complete workflow: Upload file and analyze it with polling
   * @param file The file to upload and analyze
   * @param onProgress Optional callback for progress updates
   * @param projectId Optional project ID to associate with the analysis
   * @returns Promise with analysis results
   */
  static async uploadAndAnalyze(
    file: File,
    onProgress?: (stage: "uploading" | "analyzing", message: string) => void,
    projectId?: string
  ): Promise<PDFAnalysisResponse> {
    console.log("🔄 Starting upload and analyze workflow...");
    console.log("📁 Project ID:", projectId);

    try {
      // Step 1: Upload file
      console.log("📤 Step 1: Uploading file...");
      onProgress?.("uploading", "Uploading file to server...");
      const uploadResult = await this.uploadFile(file, projectId);

      if (uploadResult.jobExecutionID) {
        // Step 2: Poll for job completion
        console.log("🔍 Step 2: Polling for job completion...");
        onProgress?.("analyzing", "Processing document...");
        const analysisResult = await this.pollJobStatus(uploadResult.jobExecutionID, onProgress);
        
        console.log("🎉 Workflow completed successfully!");
        return analysisResult;
      } else if (uploadResult.public_url) {
        // Fallback to old flow if no job ID
        console.log("🔍 Step 2: Analyzing PDF (fallback)...");
        onProgress?.("analyzing", "Analyzing PDF content and extracting data...");
        const analysisResult = await this.analyzePDF(uploadResult.public_url);
        
        console.log("🎉 Workflow completed successfully!");
        return analysisResult;
      } else {
        throw new Error("Upload completed but no job ID or public URL returned");
      }
    } catch (error) {
      console.error("💥 Upload and analyze workflow error:", error);
      throw error;
    }
  }

  /**
   * Create a new project
   * @param projectName Name of the project
   * @param userID ID of the user creating the project
   * @returns Promise with create project response
   */
  static async createProject(projectName: string, userID: string): Promise<CreateProjectResponse> {
    console.log("📁 Creating project...");
    console.log("📝 Project name:", projectName);
    console.log("👤 User ID:", userID);

    try {
      const requestBody: CreateProjectRequest = {
        projectName,
        userID,
      };

      const response = await fetch(`${API_BASE_URL}/create-project`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      console.log("📨 Create project response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ Create project failed:", {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
        });
        return {
          status: "error",
          message: errorData.message || "Failed to create project",
        };
      }

      const data: CreateProjectResponse = await response.json();
      console.log("✅ Project created successfully:", data);
      
      return data;
    } catch (error) {
      console.error("💥 Create project error:", error);

      if (error instanceof TypeError && error.message.includes("fetch")) {
        return {
          status: "error",
          message: `Network error: Cannot connect to API server at ${API_BASE_URL}. Please check if the server is running and accessible.`,
        };
      }

      return {
        status: "error",
        message: error instanceof Error ? error.message : "Failed to create project - Unknown error",
      };
    }
  }

  /**
   * Get projects for a user
   * @param userID ID of the user
   * @returns Promise with projects list
   */
  static async getProjects(userID: string): Promise<GetProjectsResponse> {
    console.log("📁 Fetching projects...");
    console.log("👤 User ID:", userID);

    try {
      const requestBody: GetProjectsRequest = {
        userID,
      };

      const response = await fetch(`${API_BASE_URL}/get-projects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      console.log("📨 Get projects response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ Get projects failed:", {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
        });
        return {
          status: "error",
          message: errorData.message || "Failed to fetch projects",
        };
      }

      const data: GetProjectsResponse = await response.json();
      console.log("✅ Projects fetched successfully:", data);
      
      return data;
    } catch (error) {
      console.error("💥 Get projects error:", error);

      if (error instanceof TypeError && error.message.includes("fetch")) {
        return {
          status: "error",
          message: `Network error: Cannot connect to API server at ${API_BASE_URL}. Please check if the server is running and accessible.`,
        };
      }

      return {
        status: "error",
        message: error instanceof Error ? error.message : "Failed to fetch projects - Unknown error",
      };
    }
  }

  /**
   * Fetch project details with PDF URLs
   * @param projectID ID of the project
   * @returns Promise with project PDFs
   */
  static async fetchProject(projectID: string): Promise<FetchProjectResponse> {
    console.log("📁 Fetching project details...");
    console.log("📝 Project ID:", projectID);

    try {
      const requestBody: FetchProjectRequest = {
        projectID,
      };

      const response = await fetch(`${API_BASE_URL}/fetch-project`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      console.log("📨 Fetch project response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ Fetch project failed:", {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
        });
        return {
          status: "error",
          message: errorData.message || "Failed to fetch project details",
        };
      }

      const data: FetchProjectResponse = await response.json();
      console.log("✅ Project details fetched successfully:", data);
      
      return data;
    } catch (error) {
      console.error("💥 Fetch project error:", error);

      if (error instanceof TypeError && error.message.includes("fetch")) {
        return {
          status: "error",
          message: `Network error: Cannot connect to API server at ${API_BASE_URL}. Please check if the server is running and accessible.`,
        };
      }

      return {
        status: "error",
        message: error instanceof Error ? error.message : "Failed to fetch project details - Unknown error",
      };
    }
  }

  /**
   * Fetch job history for a user
   * @param account_id ID of the user account
   * @returns Promise with job history
   */
  static async fetchJobs(account_id: string): Promise<FetchJobsResponse> {
    console.log("📊 Fetching job history for account:", account_id);

    try {
      const requestBody: FetchJobsRequest = {
        account_id,
      };

      const response = await fetch(`${API_BASE_URL}/fetch-jobs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      console.log("📨 Fetch jobs response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ Fetch jobs failed:", {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
        });
        return {
          status: "error",
          message: errorData.message || "Failed to fetch job history",
        };
      }

      const data: FetchJobsResponse = await response.json();
      console.log("✅ Job history fetched successfully:", data);
      
      return data;
    } catch (error) {
      console.error("💥 Fetch jobs error:", error);

      if (error instanceof TypeError && error.message.includes("fetch")) {
        return {
          status: "error",
          message: `Network error: Cannot connect to API server at ${API_BASE_URL}. Please check if the server is running and accessible.`,
        };
      }

      return {
        status: "error",
        message: error instanceof Error ? error.message : "Failed to fetch job history - Unknown error",
      };
    }
  }

  /**
   * Export analysis results
   * @param jobExecutionId The job execution ID
   * @param format The export format (XLSX or PDF)
   * @returns Promise with export response
   */
  static async exportAnalysis(jobExecutionId: string, format: "XLSX" | "PDF"): Promise<ExportAnalysisResponse> {
    console.log("📤 Exporting analysis...");
    console.log("📝 Job Execution ID:", jobExecutionId);
    console.log("📄 Format:", format);

    try {
      const requestBody: ExportAnalysisRequest = {
        jobExecutionId,
        format,
      };

      const response = await fetch(`${API_BASE_URL}/export-analysis`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      console.log("📨 Export response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ Export failed:", {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
        });
        return {
          status: "error",
          message: errorData.message || "Failed to export analysis",
        };
      }

      const data: ExportAnalysisResponse = await response.json();
      console.log("✅ Export successful:", data);
      
      return data;
    } catch (error) {
      console.error("💥 Export error:", error);

      if (error instanceof TypeError && error.message.includes("fetch")) {
        return {
          status: "error",
          message: `Network error: Cannot connect to API server at ${API_BASE_URL}. Please check if the server is running and accessible.`,
        };
      }

      return {
        status: "error",
        message: error instanceof Error ? error.message : "Failed to export analysis - Unknown error",
      };
    }
  }
}
