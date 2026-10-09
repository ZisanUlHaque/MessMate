import api from "./api";
import {
  Bazar,
  BazarSummary,
} from "@/types/bazar.types";
import { ApiResponse, PaginatedResponse } from "@/types/api.types";
import { parseDecimal } from "@/lib/helpers";

function normalizeBazar(b: any): Bazar {
  return {
    ...b,
    totalAmount: parseDecimal(b.totalAmount),
    items: (b.items || []).map((item: any) => ({
      ...item,
      quantity: parseDecimal(item.quantity),
      unitPrice: parseDecimal(item.unitPrice),
      totalPrice: parseDecimal(item.totalPrice),
    })),
  };
}

export async function addBazar(formData: FormData): Promise<Bazar> {
  const response = await api.post<ApiResponse<{ bazar: Bazar } | Bazar>>(
    "/bazar",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  const res = response.data.data;
  const bazar = "bazar" in res ? res.bazar : res;
  return normalizeBazar(bazar);
}

export async function getBazars(params: {
  messId: string;
  month?: number;
  year?: number;
  category?: string;
  page?: number;
  limit?: number;
}): Promise<{ bazars: Bazar[]; pagination?: any }> {
  const queryParams = new URLSearchParams();
  queryParams.append("messId", params.messId);
  if (params.month !== undefined) queryParams.append("month", String(params.month));
  if (params.year !== undefined) queryParams.append("year", String(params.year));
  if (params.category && params.category !== "ALL")
    queryParams.append("category", params.category);
  if (params.page !== undefined) queryParams.append("page", String(params.page));
  if (params.limit !== undefined) queryParams.append("limit", String(params.limit));

  const response = await api.get<
    PaginatedResponse<Bazar> | ApiResponse<{ bazars: Bazar[]; pagination: any }>
  >(`/bazar?${queryParams.toString()}`);

  const res = response.data;
  if ("pagination" in res && Array.isArray(res.data)) {
    return {
      bazars: res.data.map(normalizeBazar),
      pagination: res.pagination,
    };
  }

  const dataPayload: any = res.data;
  if (dataPayload && "bazars" in dataPayload) {
    return {
      bazars: (dataPayload.bazars || []).map(normalizeBazar),
      pagination: dataPayload.pagination,
    };
  }

  if (Array.isArray(dataPayload)) {
    return {
      bazars: dataPayload.map(normalizeBazar),
    };
  }

  return { bazars: [] };
}

export async function getBazarById(id: string): Promise<Bazar> {
  const response = await api.get<ApiResponse<{ bazar: Bazar } | Bazar>>(
    `/bazar/${id}`
  );
  const res = response.data.data;
  const bazar = "bazar" in res ? res.bazar : res;
  return normalizeBazar(bazar);
}

export async function updateBazar(id: string, formData: FormData): Promise<Bazar> {
  const response = await api.patch<ApiResponse<{ bazar: Bazar } | Bazar>>(
    `/bazar/${id}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  const res = response.data.data;
  const bazar = "bazar" in res ? res.bazar : res;
  return normalizeBazar(bazar);
}

export async function deleteBazar(id: string): Promise<{ message: string }> {
  const response = await api.delete<ApiResponse<{ message: string }>>(
    `/bazar/${id}`
  );
  return response.data.data || { message: response.data.message };
}

export async function getBazarSummary(
  messId: string,
  month: number,
  year: number
): Promise<BazarSummary> {
  const response = await api.get<ApiResponse<BazarSummary>>(
    `/bazar/summary?messId=${encodeURIComponent(messId)}&month=${month}&year=${year}`
  );
  const res = response.data.data;
  return {
    grandTotal: parseDecimal(res.grandTotal),
    categories: (res.categories || []).map((c) => ({
      category: c.category,
      total: parseDecimal(c.total),
    })),
  };
}
