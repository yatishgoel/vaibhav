import { ApiService } from "@/utils/api";

interface ProjectData {
  id?: string;
  name: string;
  description?: string;
  created_date?: string;
}

interface ProjectItem {
  projectID: string;
  projectName: string;
}

interface PDFItem {
  url: string;
  filename: string;
}

export class Project {
  static async list(sort?: string): Promise<ProjectData[]> {
    try {
      // Get user ID from localStorage
      const userData = localStorage.getItem("userData");
      if (!userData) {
        throw new Error("User not logged in");
      }
      
      const user = JSON.parse(userData);
      const userID = user.id;
      
      if (!userID) {
        throw new Error("User ID not found");
      }

      const response = await ApiService.getProjects(userID);
      
      if (response.status === "error") {
        throw new Error(response.message);
      }

      // Transform the API response to match our ProjectData interface
      const projects: ProjectData[] = (response.projects || []).map((project: ProjectItem) => ({
        id: project.projectID,
        name: project.projectName,
        created_date: new Date().toISOString(), // API doesn't provide this, so we use current date
      }));

      return projects;
    } catch (error) {
      console.error("Failed to fetch projects:", error);
      throw error;
    }
  }

  static async get(id: string): Promise<ProjectData | null> {
    try {
      const projects = await this.list();
      return projects.find((p) => p.id === id) || null;
    } catch (error) {
      console.error("Failed to get project:", error);
      throw error;
    }
  }

  static async create(
    data: Omit<ProjectData, "id" | "created_date">
  ): Promise<ProjectData> {
    try {
      // Get user ID from localStorage
      const userData = localStorage.getItem("userData");
      if (!userData) {
        throw new Error("User not logged in");
      }
      
      const user = JSON.parse(userData);
      const userID = user.id;
      
      if (!userID) {
        throw new Error("User ID not found");
      }

      const response = await ApiService.createProject(data.name, userID);
      
      if (response.status === "error") {
        throw new Error(response.message);
      }

      if (!response.projectID || !response.projectName) {
        throw new Error("Invalid response from server");
      }

      const newProject: ProjectData = {
        id: response.projectID,
        name: response.projectName,
        description: data.description,
        created_date: new Date().toISOString(),
      };

      return newProject;
    } catch (error) {
      console.error("Failed to create project:", error);
      throw error;
    }
  }

  static async getProjectPDFs(projectID: string): Promise<PDFItem[]> {
    console.log("📁 getProjectPDFs called with projectID:", projectID);
    try {
      const response = await ApiService.fetchProject(projectID);
      console.log("📁 fetchProject response:", response);
      
      if (response.status === "error") {
        throw new Error(response.message);
      }

      // Handle the new response format with pdf_urls
      if (response.pdf_urls && response.pdf_urls.length > 0) {
        console.log("📁 Found pdf_urls:", response.pdf_urls);
        // Convert array of URLs to PDFItem objects
        const pdfItems: PDFItem[] = response.pdf_urls.map((url, index) => {
          // Extract filename from URL or generate one
          const urlParts = url.split('/');
          const filename = urlParts[urlParts.length - 1] || `Document ${index + 1}.pdf`;
          
          return {
            url: url,
            filename: filename
          };
        });
        
        console.log("📁 Converted PDF URLs to items:", pdfItems);
        return pdfItems;
      }

      // Fallback to old format if pdfs exists
      if (response.pdfs) {
        console.log("📁 Found pdfs (old format):", response.pdfs);
        return response.pdfs;
      }

      console.log("📁 No PDFs found in response");
      return [];
    } catch (error) {
      console.error("Failed to fetch project PDFs:", error);
      throw error;
    }
  }
}
