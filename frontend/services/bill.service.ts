import api from "./api";
import {
  Bill,
  ExtraEater,
  Payment,
} from "@/types/bill.types";
import { ApiResponse } from "@/types/api.types";
import { parseDecimal } from "@/lib/helpers";

function normalizeBill(b: any): Bill {
  return {
    ...b,
    month: Number(b.month),
    year: Number(b.year),
    totalMeals: parseDecimal(b.totalMeals),
    mealRate: parseDecimal(b.mealRate),
    totalBazarShare: parseDecimal(b.totalBazarShare),
    fixedCostShare: parseDecimal(b.fixedCostShare),
    totalAmount: parseDecimal(b.totalAmount),
    paidAmount: parseDecimal(b.paidAmount),
    dueAmount: parseDecimal(b.dueAmount),
  };
}

export async function getMyBill(
  messId: string,
  month: number,
  year: number
): Promise<Bill> {
  const response = await api.get<ApiResponse<{ bill: Bill } | Bill>>(
    `/bills/my-bill?messId=${encodeURIComponent(messId)}&month=${month}&year=${year}`
  );
  const res = response.data.data;
  const bill = "bill" in res ? res.bill : res;
  return normalizeBill(bill);
}

export async function getAllBills(
  messId: string,
  month: number,
  year: number
): Promise<Bill[]> {
  const response = await api.get<ApiResponse<{ bills: Bill[] } | Bill[]>>(
    `/bills?messId=${encodeURIComponent(messId)}&month=${month}&year=${year}`
  );
  const res = response.data.data;
  const list = "bills" in res ? res.bills : (Array.isArray(res) ? res : []);
  return list.map(normalizeBill);
}

export async function generateBills(
  messId: string,
  month: number,
  year: number
): Promise<Bill[]> {
  const response = await api.post<ApiResponse<{ bills: Bill[] } | Bill[]>>(
    "/bills/generate",
    { messId, month, year }
  );
  const res = response.data.data;
  const list = "bills" in res ? res.bills : (Array.isArray(res) ? res : []);
  return list.map(normalizeBill);
}

export async function recordPayment(
  billId: string,
  data: {
    amount: number;
    method: "CASH" | "BKASH" | "BANK";
    note?: string;
  }
): Promise<{ bill: Bill; payment: Payment }> {
  const response = await api.post<
    ApiResponse<{ bill: Bill; payment: Payment }>
  >(`/bills/${billId}/pay`, data);
  const res = response.data.data;
  return {
    bill: normalizeBill(res.bill),
    payment: {
      ...res.payment,
      amount: parseDecimal(res.payment.amount),
    },
  };
}

export async function getExtraEaters(
  messId: string,
  month: number,
  year: number
): Promise<ExtraEater[]> {
  const response = await api.get<
    ApiResponse<{ flagged: ExtraEater[] } | ExtraEater[]>
  >(
    `/bills/extra-eaters?messId=${encodeURIComponent(messId)}&month=${month}&year=${year}`
  );
  const res = response.data.data;
  const list = "flagged" in res ? res.flagged : (Array.isArray(res) ? res : []);
  return list.map((e) => ({
    userId: e.userId,
    fullName: e.fullName,
    totalMeals: parseDecimal(e.totalMeals),
    averageMeals: parseDecimal(e.averageMeals),
    deviation: parseDecimal(e.deviation),
  }));
}
