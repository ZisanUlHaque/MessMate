import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as bazarService from "@/services/bazar.service";

export function useBazars(
  messId: string,
  month?: number,
  year?: number,
  category?: string,
  page?: number,
  limit?: number
) {
  return useQuery({
    queryKey: ["bazars", messId, month, year, category, page, limit],
    queryFn: () =>
      bazarService.getBazars({ messId, month, year, category, page, limit }),
    enabled: !!messId,
  });
}

export function useBazarById(id: string) {
  return useQuery({
    queryKey: ["bazar", id],
    queryFn: () => bazarService.getBazarById(id),
    enabled: !!id,
  });
}

export function useAddBazar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => bazarService.addBazar(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bazars"] });
      queryClient.invalidateQueries({ queryKey: ["bazarSummary"] });
    },
  });
}

export function useUpdateBazar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, formData }: { id: string; formData: FormData }) =>
      bazarService.updateBazar(id, formData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["bazars"] });
      queryClient.invalidateQueries({ queryKey: ["bazar", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["bazarSummary"] });
    },
  });
}

export function useDeleteBazar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => bazarService.deleteBazar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bazars"] });
      queryClient.invalidateQueries({ queryKey: ["bazarSummary"] });
    },
  });
}

export function useBazarSummary(messId: string, month: number, year: number) {
  return useQuery({
    queryKey: ["bazarSummary", messId, month, year],
    queryFn: () => bazarService.getBazarSummary(messId, month, year),
    enabled: !!messId && month > 0 && year > 0,
  });
}
