import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as billService from "@/services/bill.service";

export function useMyBill(messId: string, month: number, year: number) {
  return useQuery({
    queryKey: ["bills", "my", messId, month, year],
    queryFn: () => billService.getMyBill(messId, month, year),
    enabled: !!messId && month > 0 && year > 0,
  });
}

export function useAllBills(messId: string, month: number, year: number) {
  return useQuery({
    queryKey: ["bills", "all", messId, month, year],
    queryFn: () => billService.getAllBills(messId, month, year),
    enabled: !!messId && month > 0 && year > 0,
  });
}

export function useGenerateBills() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      messId,
      month,
      year,
    }: {
      messId: string;
      month: number;
      year: number;
    }) => billService.generateBills(messId, month, year),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bills"] });
    },
  });
}

export function useRecordPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      billId,
      data,
    }: {
      billId: string;
      data: {
        amount: number;
        method: "CASH" | "BKASH" | "BANK";
        note?: string;
      };
    }) => billService.recordPayment(billId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bills"] });
    },
  });
}

export function useExtraEaters(messId: string, month: number, year: number) {
  return useQuery({
    queryKey: ["bills", "extraEaters", messId, month, year],
    queryFn: () => billService.getExtraEaters(messId, month, year),
    enabled: !!messId && month > 0 && year > 0,
  });
}
