import { createSlice } from '@reduxjs/toolkit';
const initialState = {
    sidebarOpen: true,
    theme: localStorage.getItem('mv-theme') ?? 'system',
    viewMode: 'grid',
};
export const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        toggleSidebar(state) {
            state.sidebarOpen = !state.sidebarOpen;
        },
        setSidebarOpen(state, action) {
            state.sidebarOpen = action.payload;
        },
        setTheme(state, action) {
            state.theme = action.payload;
            localStorage.setItem('mv-theme', action.payload);
        },
        setViewMode(state, action) {
            state.viewMode = action.payload;
        },
    },
});
export const { toggleSidebar, setSidebarOpen, setTheme, setViewMode } = uiSlice.actions;
export default uiSlice.reducer;
//# sourceMappingURL=ui.slice.js.map