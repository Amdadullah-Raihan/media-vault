import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '@/constants';
export const rolesApi = createApi({
    reducerPath: 'rolesApi',
    baseQuery: fetchBaseQuery({
        baseUrl: API_BASE_URL,
        credentials: 'include',
    }),
    tagTypes: ['Roles'],
    endpoints: (builder) => ({
        getRoles: builder.query({
            query: () => '/roles',
            providesTags: ['Roles'],
        }),
        getRole: builder.query({
            query: (id) => `/roles/${id}`,
            providesTags: (_result, _error, id) => [{ type: 'Roles', id }],
        }),
        createRole: builder.mutation({
            query: (body) => ({
                url: '/roles',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Roles'],
        }),
        updateRole: builder.mutation({
            query: ({ id, data }) => ({
                url: `/roles/${id}`,
                method: 'PATCH',
                body: data,
            }),
            invalidatesTags: (_result, _error, { id }) => [{ type: 'Roles', id }, 'Roles'],
        }),
        deleteRole: builder.mutation({
            query: (id) => ({
                url: `/roles/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Roles'],
        }),
        duplicateRole: builder.mutation({
            query: (id) => ({
                url: `/roles/${id}/duplicate`,
                method: 'POST',
            }),
            invalidatesTags: ['Roles'],
        }),
    }),
});
export const { useGetRolesQuery, useGetRoleQuery, useCreateRoleMutation, useUpdateRoleMutation, useDeleteRoleMutation, useDuplicateRoleMutation, } = rolesApi;
//# sourceMappingURL=roles.service.js.map