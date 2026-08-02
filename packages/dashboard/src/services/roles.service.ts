import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { ApiResponse, Role, CreateRoleRequest, UpdateRoleRequest } from '@/types';
import { API_BASE_URL } from '@/constants';

export const rolesApi = createApi({
  reducerPath: 'rolesApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    credentials: 'include',
  }),
  tagTypes: ['Roles'],
  endpoints: (builder) => ({
    getRoles: builder.query<ApiResponse<Role[]>, void>({
      query: () => '/roles',
      providesTags: ['Roles'],
    }),
    getRole: builder.query<ApiResponse<Role>, string>({
      query: (id) => `/roles/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Roles', id }],
    }),
    createRole: builder.mutation<ApiResponse<Role>, CreateRoleRequest>({
      query: (body) => ({
        url: '/roles',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Roles'],
    }),
    updateRole: builder.mutation<ApiResponse<Role>, { id: string; data: UpdateRoleRequest }>({
      query: ({ id, data }) => ({
        url: `/roles/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Roles', id }, 'Roles'],
    }),
    deleteRole: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({
        url: `/roles/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Roles'],
    }),
    duplicateRole: builder.mutation<ApiResponse<Role>, string>({
      query: (id) => ({
        url: `/roles/${id}/duplicate`,
        method: 'POST',
      }),
      invalidatesTags: ['Roles'],
    }),
  }),
});

export const {
  useGetRolesQuery,
  useGetRoleQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  useDuplicateRoleMutation,
} = rolesApi;
