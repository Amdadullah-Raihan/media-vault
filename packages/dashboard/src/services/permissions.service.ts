import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { ApiResponse, PermissionsCatalog } from '@/types';
import { API_BASE_URL } from '@/constants';

export const permissionsApi = createApi({
  reducerPath: 'permissionsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    credentials: 'include',
  }),
  tagTypes: ['Permissions'],
  endpoints: (builder) => ({
    getPermissions: builder.query<ApiResponse<PermissionsCatalog>, void>({
      query: () => '/permissions',
      providesTags: ['Permissions'],
    }),
  }),
});

export const { useGetPermissionsQuery } = permissionsApi;
