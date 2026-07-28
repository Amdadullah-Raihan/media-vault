import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { ApiResponse, Folder, CreateFolderRequest } from '@/types';
import { API_BASE_URL } from '@/constants';

export const foldersApi = createApi({
  reducerPath: 'foldersApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    credentials: 'include',
  }),
  tagTypes: ['Folders'],
  endpoints: (builder) => ({
    getFolders: builder.query<ApiResponse<Folder[]>, string | void>({
      query: (projectId) => ({
        url: '/folders',
        params: projectId ? { projectId } : {},
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'Folders' as const, id })),
              { type: 'Folders', id: 'LIST' },
            ]
          : [{ type: 'Folders', id: 'LIST' }],
    }),
    getFolder: builder.query<ApiResponse<Folder>, string>({
      query: (id) => `/folders/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Folders', id }],
    }),
    getFolderChildren: builder.query<ApiResponse<Folder[]>, string>({
      query: (id) => `/folders/${id}/children`,
      providesTags: (_result, _error, id) => [{ type: 'Folders', id }],
    }),
    createFolder: builder.mutation<ApiResponse<Folder>, CreateFolderRequest>({
      query: (body) => ({
        url: '/folders',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Folders', id: 'LIST' }],
    }),
    deleteFolder: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({
        url: `/folders/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Folders', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetFoldersQuery,
  useGetFolderQuery,
  useGetFolderChildrenQuery,
  useCreateFolderMutation,
  useDeleteFolderMutation,
} = foldersApi;
