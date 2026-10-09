import { create } from "zustand";

export interface SnackbarState {
  visible: boolean;
  message: string;
  type: "success" | "error" | "info";
}

export interface UIState {
  snackbar: SnackbarState;
  showSnackbar: (message: string, type?: "success" | "error" | "info") => void;
  hideSnackbar: () => void;
}

let snackbarTimer: ReturnType<typeof setTimeout> | null = null;

export const useUIStore = create<UIState>((set) => ({
  snackbar: {
    visible: false,
    message: "",
    type: "info",
  },

  showSnackbar: (message: string, type = "info") => {
    if (snackbarTimer) {
      clearTimeout(snackbarTimer);
    }

    set({
      snackbar: {
        visible: true,
        message,
        type,
      },
    });

    snackbarTimer = setTimeout(() => {
      set((state) => ({
        snackbar: {
          ...state.snackbar,
          visible: false,
        },
      }));
    }, 3000);
  },

  hideSnackbar: () => {
    if (snackbarTimer) {
      clearTimeout(snackbarTimer);
    }
    set((state) => ({
      snackbar: {
        ...state.snackbar,
        visible: false,
      },
    }));
  },
}));
