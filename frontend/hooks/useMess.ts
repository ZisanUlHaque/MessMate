import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as messService from "@/services/mess.service";
import { useMessStore } from "@/stores/messStore";

export function useMyMesses() {
  return useQuery({
    queryKey: ["messes"],
    queryFn: () => messService.getMyMesses(),
  });
}

export function useMessById(id: string) {
  return useQuery({
    queryKey: ["mess", id],
    queryFn: () => messService.getMessById(id),
    enabled: !!id,
  });
}

export function useCreateMess() {
  const queryClient = useQueryClient();
  const fetchMesses = useMessStore((state) => state.fetchMesses);

  return useMutation({
    mutationFn: (data: { name: string; address?: string }) =>
      messService.createMess(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["messes"] });
      await fetchMesses();
    },
  });
}

export function useJoinMess() {
  const queryClient = useQueryClient();
  const fetchMesses = useMessStore((state) => state.fetchMesses);

  return useMutation({
    mutationFn: ({
      inviteCode,
      messId,
    }: {
      inviteCode: string;
      messId?: string;
    }) => messService.joinMess(inviteCode, messId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["messes"] });
      await fetchMesses();
    },
  });
}

export function useApproveMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ messId, userId }: { messId: string; userId: string }) =>
      messService.approveMember(messId, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["mess", variables.messId] });
      queryClient.invalidateQueries({ queryKey: ["messes"] });
    },
  });
}

export function useRejectMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ messId, userId }: { messId: string; userId: string }) =>
      messService.rejectMember(messId, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["mess", variables.messId] });
      queryClient.invalidateQueries({ queryKey: ["messes"] });
    },
  });
}

export function useRemoveMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ messId, userId }: { messId: string; userId: string }) =>
      messService.removeMember(messId, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["mess", variables.messId] });
      queryClient.invalidateQueries({ queryKey: ["messes"] });
    },
  });
}

export function useUpdateMess() {
  const queryClient = useQueryClient();
  const fetchMesses = useMessStore((state) => state.fetchMesses);

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<{
        name: string;
        address: string;
        monthlyGasBill: number;
        monthlyUtilityBill: number;
      }>;
    }) => messService.updateMess(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["mess", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["messes"] });
      fetchMesses();
    },
  });
}

export function useRefreshInviteCode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (messId: string) => messService.refreshInviteCode(messId),
    onSuccess: (_, messId) => {
      queryClient.invalidateQueries({ queryKey: ["mess", messId] });
    },
  });
}
