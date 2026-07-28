import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark' | 'system';
  viewMode: 'grid' | 'table';
}

const initialState: UIState = {
  sidebarOpen: true,
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
    setTheme(state, action: PayloadAction<UIState['theme']>) {
      state.theme = action.payload;
      localStorage.setItem('mv-theme', action.payload);
    },
    setViewMode(state, action: PayloadAction<UIState['viewMode']>) {
      state.viewMode = action.payload;
    },
  },
});

export const { toggleSidebar, setSidebarOpen, setTheme, setViewMode } = uiSlice.actions;
export default uiSlice.reducer;
