import {
  PDFAnalysisResponse,
  PDFAnalysisRequest,
} from "@/entities/LeaseAnalysis";

// const API_BASE_URL =
//   process.env.NEXT_PUBLIC_API_BASE_URL  || "http://20.195.13.138" || "http://localhost:8000" ; 

const API_BASE_URL =
     "http://localhost:8000" ; 

  
interface FileUploadResponse {
  status: "success" | "error";
  message: string;
  filename: string;
  public_url: string;
  original_filename: string;
  file_size: number;
  bucket: string;
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
  static async uploadFile(file: File, projectId?: string): Promise<string> {
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
      const fileUrl = await this.uploadFile(file, projectId);

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
}
