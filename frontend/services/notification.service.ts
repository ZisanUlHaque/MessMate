import api from "./api";
import { Notification } from "@/types/notification.types";
import { ApiResponse } from "@/types/api.types";

export async function getNotifications(params?: {
  isRead?: boolean;
  page?: number;
  limit?: number;
}): Promise<{ notifications: Notification[]; pagination?: any }> {
  const queryParams = new URLSearchParams();
  if (params?.isRead !== undefined) {
    queryParams.append("isRead", String(params.isRead));
  }
  if (params?.page !== undefined) {
    queryParams.append("page", String(params.page));
  }
  if (params?.limit !== undefined) {
    queryParams.append("limit", String(params.limit));
  }

  const queryStr = queryParams.toString();
  const url = queryStr ? `/notifications?${queryStr}` : "/notifications";
  const response = await api.get<
    ApiResponse<{ notifications: Notification[]; pagination?: any } | Notification[]>
  >(url);

  const res = response.data.data;
  if (Array.isArray(res)) {
    return { notifications: res };
  }
  if (res && "notifications" in res) {
    return {
      notifications: res.notifications || [],
      pagination: res.pagination,
    };
  }
  return { notifications: [] };
}

export async function markAsRead(id: string): Promise<{ message: string }> {
  const response = await api.patch<ApiResponse<{ message: string }>>(
    `/notifications/${id}/read`
  );
  return response.data.data || { message: response.data.message };
}

export async function markAllAsRead(): Promise<{ message: string }> {
  const response = await api.patch<ApiResponse<{ message: string }>>(
    "/notifications/read-all"
  );
  return response.data.data || { message: response.data.message };
}
