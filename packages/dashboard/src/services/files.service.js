import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '@/constants';
export const filesApi = createApi({
    reducerPath: 'filesApi',
    baseQuery: fetchBaseQuery({
        baseUrl: API_BASE_URL,
        credentials: 'include',
    }),
    tagTypes: ['Files'],
    endpoints: (builder) => ({
        getFiles: builder.query({
            query: (params) => ({
                url: '/files',
                params: params ?? {},
            }),
            providesTags: (result) => result
                ? [
                    ...result.data.data.map(({ id }) => ({ type: 'Files', id })),
                    { type: 'Files', id: 'LIST' },
                ]
                : [{ type: 'Files', id: 'LIST' }],
        }),
        getFile: builder.query({
            query: (id) => `/files/${id}`,
            providesTags: (_result, _error, id) => [{ type: 'Files', id }],
        }),
        uploadFile: builder.mutation({
            query: ({ file, projectId, folderId, visibility }) => {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('projectId', projectId);
                if (folderId)
                    formData.append('folderId', folderId);
                if (visibility)
                    formData.append('visibility', visibility);
                return {
                    url: '/files/upload',
                    method: 'POST',
                    body: formData,
                };
            },
            invalidatesTags: [{ type: 'Files', id: 'LIST' }],
        }),
        updateFile: builder.mutation({
            query: ({ id, body }) => ({
                url: `/files/${id}`,
                method: 'PATCH',
                body,
            }),
            invalidatesTags: (_result, _error, { id }) => [{ type: 'Files', id }],
        }),
        deleteFile: builder.mutation({
            query: (id) => ({
                url: `/files/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: [{ type: 'Files', id: 'LIST' }],
        }),
        getSignedUrl: builder.mutation({
            query: ({ fileId, body }) => ({
                url: `/files/${fileId}/signed-url`,
                method: 'POST',
                body,
            }),
        }),
        getDownloadUrl: builder.query({
            query: (id) => `/files/${id}/download`,
        }),
    }),
});
export const { useGetFilesQuery, useGetFileQuery, useUploadFileMutation, useUpdateFileMutation, useDeleteFileMutation, useGetSignedUrlMutation, useGetDownloadUrlQuery, } = filesApi;
//# sourceMappingURL=files.service.js.map