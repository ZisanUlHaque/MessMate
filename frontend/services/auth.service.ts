import api from "./api";
import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
} from "@/types/auth.types";
import { ApiResponse } from "@/types/api.types";

export async function register(data: RegisterRequest): Promise<AuthResponse> {
  const response = await api.post<ApiResponse<AuthResponse>>("/auth/register", data);
  return response.data.data;
}

export async function login(data: LoginRequest): Promise<AuthResponse> {
  const response = await api.post<ApiResponse<AuthResponse>>("/auth/login", data);
  return response.data.data;
}

export async function getProfile(): Promise<User> {
  const response = await api.get<ApiResponse<{ user: User } | User>>("/auth/me");
  const result = response.data.data;
  if ("user" in result) {
    return result.user;
  }
  return result;
}

export async function updateProfile(data: Partial<User>): Promise<User> {
  const response = await api.patch<ApiResponse<{ user: User } | User>>("/auth/me", data);
  const result = response.data.data;
  if ("user" in result) {
    return result.user;
  }
  return result;
}

export async function changePassword(
  oldPassword: string,
  newPassword: string
): Promise<{ message: string }> {
  const response = await api.patch<ApiResponse<{ message: string }>>(
    "/auth/change-password",
    { oldPassword, newPassword }
  );
  return response.data.data || { message: response.data.message };
}
