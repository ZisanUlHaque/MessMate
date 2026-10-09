import { create } from "zustand";
import * as authService from "@/services/auth.service";
import { setToken, getToken, removeToken } from "@/lib/storage";
import { User } from "@/types/auth.types";
import { router } from "expo-router";

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (phone: string, password: string) => Promise<void>;
  register: (fullName: string, phone: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (phone: string, password: string) => {
    try {
      set({ isLoading: true });
      const authData = await authService.login({ phone, password });
      await setToken(authData.token);
      set({
        user: authData.user,
        token: authData.token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (fullName: string, phone: string, password: string) => {
    try {
      set({ isLoading: true });
      const authData = await authService.register({
        fullName,
        phone,
        password,
      });
      await setToken(authData.token);
      set({
        user: authData.user,
        token: authData.token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    await removeToken();
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
    router.replace("/(auth)/login");
  },

  checkAuth: async () => {
    try {
      set({ isLoading: true });
      const token = await getToken();
      if (!token) {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
        return;
      }

      const user = await authService.getProfile();
      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch {
      await removeToken();
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  updateUser: (data: Partial<User>) => {
    const currentUser = get().user;
    if (currentUser) {
      set({ user: { ...currentUser, ...data } });
    }
  },
}));
