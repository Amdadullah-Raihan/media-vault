import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '@/constants';
export const usersApi = createApi({
    reducerPath: 'usersApi',
    baseQuery: fetchBaseQuery({
        baseUrl: API_BASE_URL,
        credentials: 'include',
    }),
    tagTypes: ['Users'],
    endpoints: (builder) => ({
        getUsers: builder.query({
            query: () => '/users',
            providesTags: ['Users'],
        }),
        getUser: builder.query({
            query: (id) => `/users/${id}`,
            providesTags: (_result, _error, id) => [{ type: 'Users', id }],
        }),
        createUser: builder.mutation({
            query: (body) => ({
                url: '/users',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Users'],
        }),
        updateUser: builder.mutation({
            query: ({ id, data }) => ({
                url: `/users/${id}`,
                method: 'PATCH',
                body: data,
            }),
            invalidatesTags: (_result, _error, { id }) => [{ type: 'Users', id }, 'Users'],
        }),
        deleteUser: builder.mutation({
            query: (id) => ({
                url: `/users/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Users'],
        }),
        suspendUser: builder.mutation({
            query: (id) => ({
                url: `/users/${id}/suspend`,
                method: 'POST',
            }),
            invalidatesTags: (_result, _error, id) => [{ type: 'Users', id }, 'Users'],
        }),
        restoreUser: builder.mutation({
            query: (id) => ({
                url: `/users/${id}/restore`,
                method: 'POST',
            }),
            invalidatesTags: (_result, _error, id) => [{ type: 'Users', id }, 'Users'],
        }),
        unlockUser: builder.mutation({
            query: (id) => ({
                url: `/users/${id}/unlock`,
                method: 'POST',
            }),
            invalidatesTags: (_result, _error, id) => [{ type: 'Users', id }, 'Users'],
        }),
    }),
});
export const { useGetUsersQuery, useGetUserQuery, useCreateUserMutation, useUpdateUserMutation, useDeleteUserMutation, useSuspendUserMutation, useRestoreUserMutation, useUnlockUserMutation, } = usersApi;
//# sourceMappingURL=users.service.js.map