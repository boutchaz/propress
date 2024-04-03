import create from "zustand";

type DialogState = {
  isOpen: boolean;
  itemId: string | null;
  toggle: () => void;
  open: () => void;
  close: () => void;
  setItemId: (itemId: string | null) => void;
  getItemId: () => string | null;
};

export const useDrawerStore = create<DialogState>((set, get) => ({
  isOpen: false,
  itemId: null,
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  setItemId: (itemId: string | null) => set({ itemId }),
  getItemId: () => get().itemId,
}));
