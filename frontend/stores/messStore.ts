import { create } from "zustand";
import * as messService from "@/services/mess.service";
import { Mess } from "@/types/mess.types";
import { setMessId, getMessId } from "@/lib/storage";

export interface MessState {
  currentMess: Mess | null;
  messes: Mess[];
  isLoading: boolean;
  fetchMesses: () => Promise<void>;
  setCurrentMess: (mess: Mess | null) => void;
  refreshMesses: () => Promise<void>;
}

export const useMessStore = create<MessState>((set, get) => ({
  currentMess: null,
  messes: [],
  isLoading: false,

  fetchMesses: async () => {
    try {
      set({ isLoading: true });
      const messes = await messService.getMyMesses();
      const savedMessId = await getMessId();

      let current = get().currentMess;
      if (messes.length > 0) {
        if (savedMessId) {
          const match = messes.find((m) => m.id === savedMessId);
          current = match || messes[0];
        } else if (!current || !messes.some((m) => m.id === current?.id)) {
          current = messes[0];
        }
      } else {
        current = null;
      }

      if (current) {
        await setMessId(current.id);
      }

      set({ messes, currentMess: current, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  setCurrentMess: async (mess: Mess | null) => {
    if (mess) {
      await setMessId(mess.id);
    }
    set({ currentMess: mess });
  },

  refreshMesses: async () => {
    await get().fetchMesses();
  },
}));
