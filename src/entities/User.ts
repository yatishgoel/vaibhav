// User entity that connects to your backend API
import { ApiService } from "@/utils/api";

interface UserData {
  id?: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role: string;
  accountID?: string;
}

export class User {
  static async me(): Promise<UserData> {
    try {
      // First try to get user data from localStorage (from login response)
      const storedUserData = localStorage.getItem("userData");
      if (storedUserData) {
        const userData = JSON.parse(storedUserData);
        console.log("✅ Retrieved user data from localStorage:", userData);
        return userData;
      }

      // If no stored data, try to get from backend
      const response = await fetch(`${ApiService.getBaseUrl()}/user-profile`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
        },
        // Include credentials for session-based auth
        credentials: "include",
      });

      if (response.ok) {
        const userData = await response.json();
        // Store the fetched data for future use
        localStorage.setItem("userData", JSON.stringify(userData));
        return userData;
      } else {
        // Fallback to mock data if backend is not available
        console.warn("Could not fetch user profile from backend, using mock data");
        return {
          id: "user_123",
          email: "vaibhav@aegystech.com",
          full_name: "Vaibhav",
          role: "admin",
          avatar_url: undefined,
        };
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      // Fallback to mock data
      return {
        id: "user_123",
        email: "vaibhav@aegystech.com",
        full_name: "Vaibhav",
        role: "admin",
        avatar_url: undefined,
      };
    }
  }

  static async updateMyUserData(data: Partial<UserData>): Promise<UserData> {
    try {
      const response = await fetch(`${ApiService.getBaseUrl()}/user-profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const updatedUserData = await response.json();
        // Update localStorage with the new data
        localStorage.setItem("userData", JSON.stringify(updatedUserData));
        return updatedUserData;
      } else {
        throw new Error("Failed to update user profile");
      }
    } catch (error) {
      console.error("Error updating user profile:", error);
      // Fallback to mock update
      const currentUser = await this.me();
      const updatedUser = {
        ...currentUser,
        ...data,
      };
      // Update localStorage with the new data
      localStorage.setItem("userData", JSON.stringify(updatedUser));
      return updatedUser;
    }
  }

  /**
   * Clear stored user data (for logout)
   */
  static logout(): void {
    localStorage.removeItem("userData");
    console.log("✅ User data cleared from localStorage");
  }
}
