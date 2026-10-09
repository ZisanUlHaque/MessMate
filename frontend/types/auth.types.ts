export interface User {
  id: string;
  fullName: string;
  phone: string;
  role: "MANAGER" | "MEMBER";
  profileImage: string | null;
  expoPushToken: string | null;
  createdAt: string;
}

export interface LoginRequest {
  phone: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  phone: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
