import api from "./api";
import { Mess, MessMember, MessWithMembers } from "@/types/mess.types";
import { ApiResponse } from "@/types/api.types";
import { parseDecimal } from "@/lib/helpers";

function normalizeMess(m: any): Mess {
  return {
    ...m,
    monthlyGasBill: parseDecimal(m.monthlyGasBill),
    monthlyUtilityBill: parseDecimal(m.monthlyUtilityBill),
  };
}

export async function createMess(data: {
  name: string;
  address?: string;
}): Promise<Mess> {
  const response = await api.post<ApiResponse<{ mess: Mess } | Mess>>(
    "/mess",
    data
  );
  const res = response.data.data;
  const mess = "mess" in res ? res.mess : res;
  return normalizeMess(mess);
}

export async function getMyMesses(): Promise<Mess[]> {
  const response = await api.get<ApiResponse<{ messes: Mess[] } | Mess[]>>(
    "/mess"
  );
  const res = response.data.data;
  const list = "messes" in res ? res.messes : (Array.isArray(res) ? res : []);
  return list.map(normalizeMess);
}

export async function getMessById(id: string): Promise<MessWithMembers> {
  const response = await api.get<
    ApiResponse<{ mess: Mess; members: MessMember[] } | MessWithMembers>
  >(`/mess/${id}`);
  const res = response.data.data;
  if ("mess" in res && "members" in res) {
    return {
      ...normalizeMess(res.mess),
      members: res.members || [],
    };
  }
  const full = res as MessWithMembers;
  return {
    ...normalizeMess(full),
    members: full.members || [],
  };
}

export async function updateMess(
  id: string,
  data: Partial<{
    name: string;
    address: string;
    monthlyGasBill: number;
    monthlyUtilityBill: number;
  }>
): Promise<Mess> {
  const response = await api.patch<ApiResponse<{ mess: Mess } | Mess>>(
    `/mess/${id}`,
    data
  );
  const res = response.data.data;
  const mess = "mess" in res ? res.mess : res;
  return normalizeMess(mess);
}

export async function joinMess(
  inviteCode: string,
  messId?: string
): Promise<{ message: string }> {
  // If messId is not provided, we can call /mess/join or resolve if backend allows
  const endpoint = messId ? `/mess/${messId}/join` : `/mess/join`;
  const response = await api.post<ApiResponse<{ message: string }>>(endpoint, {
    inviteCode,
  });
  return response.data.data || { message: response.data.message };
}

export async function approveMember(
  messId: string,
  userId: string
): Promise<{ message: string }> {
  const response = await api.patch<ApiResponse<{ message: string }>>(
    `/mess/${messId}/members/${userId}/approve`
  );
  return response.data.data || { message: response.data.message };
}

export async function rejectMember(
  messId: string,
  userId: string
): Promise<{ message: string }> {
  const response = await api.patch<ApiResponse<{ message: string }>>(
    `/mess/${messId}/members/${userId}/reject`
  );
  return response.data.data || { message: response.data.message };
}

export async function removeMember(
  messId: string,
  userId: string
): Promise<{ message: string }> {
  const response = await api.delete<ApiResponse<{ message: string }>>(
    `/mess/${messId}/members/${userId}`
  );
  return response.data.data || { message: response.data.message };
}

export async function refreshInviteCode(
  messId: string
): Promise<{ inviteCode: string }> {
  const response = await api.post<
    ApiResponse<{ inviteCode: string } | string>
  >(`/mess/${messId}/invite-code/refresh`);
  const res = response.data.data;
  if (typeof res === "string") {
    return { inviteCode: res };
  }
  return res;
}
