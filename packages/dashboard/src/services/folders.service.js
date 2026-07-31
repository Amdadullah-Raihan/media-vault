import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '@/constants';
export const foldersApi = createApi({
    reducerPath: 'foldersApi',
    baseQuery: fetchBaseQuery({
        baseUrl: API_BASE_URL,
        credentials: 'include',
    }),
    tagTypes: ['Folders'],
    endpoints: (builder) => ({
        getFolders: builder.query({
            query: (projectId) => ({
                url: '/folders',
                params: projectId ? { projectId } : {},
            }),
            providesTags: (result) => result
                ? [
                    ...result.data.map(({ id }) => ({ type: 'Folders', id })),
                    { type: 'Folders', id: 'LIST' },
                ]
                : [{ type: 'Folders', id: 'LIST' }],
        }),
        getFolder: builder.query({
            query: (id) => `/folders/${id}`,
            providesTags: (_result, _error, id) => [{ type: 'Folders', id }],
        }),
        getFolderChildren: builder.query({
            query: (id) => `/folders/${id}/children`,
            providesTags: (_result, _error, id) => [{ type: 'Folders', id }],
        }),
        createFolder: builder.mutation({
            query: (body) => ({
                url: '/folders',
                method: 'POST',
                body,
            }),
            invalidatesTags: [{ type: 'Folders', id: 'LIST' }],
        }),
        deleteFolder: builder.mutation({
            query: (id) => ({
                url: `/folders/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: [{ type: 'Folders', id: 'LIST' }],
        }),
    }),
});
export const { useGetFoldersQuery, useGetFolderQuery, useGetFolderChildrenQuery, useCreateFolderMutation, useDeleteFolderMutation, } = foldersApi;
//# sourceMappingURL=folders.service.js.map