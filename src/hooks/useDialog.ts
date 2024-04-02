import create from "zustand";

type DialogState = {
  isOpen: boolean;
  itemId: string | null;
  toggle: () => void;
  open: () => void;
  close: () => void;
  setItemId: (itemId: string) => void;
  getItemId: () => string | null;
};

export const useDialogStore = create<DialogState>((set, get) => ({
  isOpen: false,
  itemId: null,
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  setItemId: (itemId: string) => set({ itemId }),
  getItemId: () => get().itemId,
}));
