// Mock LeaseAnalysis entity for demo purposes
// In a real app, this would connect to your backend API

interface LeaseAnalysisData {
  id?: string;
  lease_name: string;
  abstract_data?: Record<string, unknown>;
  analysis_type: "abstract" | "benchmark";
  file_url?: string;
  status: "processing" | "completed" | "failed";
  project_id?: string;
  comments?: string;
  created_date?: string;
}

export class LeaseAnalysis {
  static async list(
    sort?: string,
    limit?: number
  ): Promise<LeaseAnalysisData[]> {
    // Mock data for demo
    const mockData: LeaseAnalysisData[] = [];

    let result = [...mockData];

    if (sort === "-created_date") {
      result.sort(
        (a, b) =>
          new Date(b.created_date!).getTime() -
          new Date(a.created_date!).getTime()
      );
    }

    if (limit) {
      result = result.slice(0, limit);
    }

    return result;
  }

  static async filter(
    criteria: { project_id: string },
    sort?: string
  ): Promise<LeaseAnalysisData[]> {
    const allData = await this.list(sort);
    return allData.filter((item) => item.project_id === criteria.project_id);
  }

  static async create(
    data: Omit<LeaseAnalysisData, "id" | "created_date">
  ): Promise<LeaseAnalysisData> {
    // Mock creation
    const newAnalysis: LeaseAnalysisData = {
      id: Math.random().toString(36).substr(2, 9),
      created_date: new Date().toISOString(),
      ...data,
    };
    return newAnalysis;
  }
}
