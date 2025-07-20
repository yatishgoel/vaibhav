// Mock User entity for demo purposes
// In a real app, this would connect to your backend API

interface UserData {
  id?: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role: string;
}

export class User {
  static async me(): Promise<UserData> {
    // Mock current user data
    return {
      id: "user_123",
      email: "vaibhav@aegystech.com",
      full_name: "Vaibhav",
      role: "admin",
      avatar_url: undefined, // Will show initials instead
    };
  }

  static async updateMyUserData(data: Partial<UserData>): Promise<UserData> {
    // Mock update - in reality this would send to backend
    const currentUser = await this.me();
    return {
      ...currentUser,
      ...data,
    };
  }
}
