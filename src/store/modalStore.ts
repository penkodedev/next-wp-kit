// src/store/modalStore.ts
import { create } from 'zustand';

/**
 * Defines the state and actions for the modal store.
 */
interface ModalState {
  modalSlug: string | null;
  isOpen: boolean;
  openModal: (slug: string) => void;
  closeModal: () => void;
}

/**
 * Creates a Zustand store for managing the global modal state.
 * This allows any component to open or close a modal.
 */
export const useModalStore = create<ModalState>((set) => ({
  modalSlug: null,
  isOpen: false,
  openModal: (slug) => set({ isOpen: true, modalSlug: slug }),
  closeModal: () => set({ isOpen: false, modalSlug: null }),
}));
