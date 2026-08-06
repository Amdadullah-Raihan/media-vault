import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  sidebarOpen: boolean;
  mobileMenuOpen: boolean;
  theme: 'light' | 'dark' | 'system';
  viewMode: 'grid' | 'table';
}

const initialState: UIState = {
  sidebarOpen: true,
  mobileMenuOpen: false,
  theme: (localStorage.getItem('mv-theme') as UIState['theme']) ?? 'system',
  viewMode: 'grid',
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen(state, action: PayloadAction<boolean>) {
      state.sidebarOpen = action.payload;
    },
    toggleMobileMenu(state) {
      state.mobileMenuOpen = !state.mobileMenuOpen;
    },
    setMobileMenuOpen(state, action: PayloadAction<boolean>) {
      state.mobileMenuOpen = action.payload;
    },
    setTheme(state, action: PayloadAction<UIState['theme']>) {
      state.theme = action.payload;
      localStorage.setItem('mv-theme', action.payload);
    },
    setViewMode(state, action: PayloadAction<UIState['viewMode']>) {
      state.viewMode = action.payload;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  toggleMobileMenu,
  setMobileMenuOpen,
  setTheme,
  setViewMode,
} = uiSlice.actions;
export default uiSlice.reducer;
