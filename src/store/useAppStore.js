import { create } from 'zustand';

export const useAppStore = create((set) => ({
    isOverlayVisible: false, 
    searchResults: [],
    searchValue: '',
    openSidebar: false,
    openModal: false,
    showSignUp: false,
    toggleSidebar: (data) => set(() => ({ openSidebar: data })),
    toggleModal: () => set((state) => ({ openModal: !state.openModal })),
    setSearchResults: (data) => set(() => ({ searchResults: data })),
    setSearchValue: (data) => set(() => ({ searchValue: data })),
    setOverlayVisible: (isVisible) => set({ isOverlayVisible: isVisible }),
    setShowSignUp: (showSignUp) => set(() => ({ showSignUp: showSignUp })),
}));
