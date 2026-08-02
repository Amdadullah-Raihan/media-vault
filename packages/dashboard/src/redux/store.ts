import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux';
import { authApi } from '@/services/auth.service';
import { projectsApi } from '@/services/projects.service';
import { apiKeysApi } from '@/services/api-keys.service';
import { filesApi } from '@/services/files.service';
import { foldersApi } from '@/services/folders.service';
import { settingsApi } from '@/services/settings.service';
import { uploadRulesApi } from '@/services/upload-rules.service';
import { usersApi } from '@/services/users.service';
import { rolesApi } from '@/services/roles.service';
import { permissionsApi } from '@/services/permissions.service';
import uiReducer from '@/redux/slices/ui.slice';

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    [authApi.reducerPath]: authApi.reducer,
    [projectsApi.reducerPath]: projectsApi.reducer,
    [apiKeysApi.reducerPath]: apiKeysApi.reducer,
    [filesApi.reducerPath]: filesApi.reducer,
    [foldersApi.reducerPath]: foldersApi.reducer,
    [settingsApi.reducerPath]: settingsApi.reducer,
    [uploadRulesApi.reducerPath]: uploadRulesApi.reducer,
    [usersApi.reducerPath]: usersApi.reducer,
    [rolesApi.reducerPath]: rolesApi.reducer,
    [permissionsApi.reducerPath]: permissionsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      projectsApi.middleware,
      apiKeysApi.middleware,
      filesApi.middleware,
      foldersApi.middleware,
      settingsApi.middleware,
      uploadRulesApi.middleware,
      usersApi.middleware,
      rolesApi.middleware,
      permissionsApi.middleware,
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
