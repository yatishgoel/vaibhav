// Mock Project entity for demo purposes
// In a real app, this would connect to your backend API

interface ProjectData {
  id?: string;
  name: string;
  description?: string;
  created_date?: string;
}

export class Project {
  static async list(sort?: string): Promise<ProjectData[]> {
    // Mock data for demo
    return [];
  }

  static async get(id: string): Promise<ProjectData | null> {
    const projects = await this.list();
    return projects.find((p) => p.id === id) || null;
  }

  static async create(
    data: Omit<ProjectData, "id" | "created_date">
  ): Promise<ProjectData> {
    // Mock creation
    const newProject: ProjectData = {
      id: Math.random().toString(36).substr(2, 9),
      created_date: new Date().toISOString(),
      ...data,
    };
    return newProject;
  }
}
