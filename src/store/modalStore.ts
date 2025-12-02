// src/store/modalStore.ts
import { create } from 'zustand';

// State and actions for the modal store
interface ModalState {
  modalSlug: string | null;
  isOpen: boolean;
  openModal: (slug: string) => void;
  closeModal: () => void;
}

/**
 * Zustand store for global modal state. Allows any component to open or close a modal.
 */
export const useModalStore = create<ModalState>((set) => ({
  modalSlug: null,
  isOpen: false,
  openModal: (slug) => set({ isOpen: true, modalSlug: slug }),
  closeModal: () => set({ isOpen: false, modalSlug: null }),
}));
