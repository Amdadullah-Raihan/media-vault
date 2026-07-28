import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type {
  ApiResponse,
  PaginatedResult,
  FileMetadata,
  UpdateFileMetadataRequest,
  SignedUrl,
  CreateSignedUrlRequest,
} from '@/types';
import { API_BASE_URL } from '@/constants';

interface ListFilesParams {
  projectId?: string;
  folderId?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

export const filesApi = createApi({
  reducerPath: 'filesApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    credentials: 'include',
  }),
  tagTypes: ['Files'],
  endpoints: (builder) => ({
    getFiles: builder.query<ApiResponse<PaginatedResult<FileMetadata>>, ListFilesParams | void>({
      query: (params) => ({
        url: '/files',
        params: params ?? {},
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.data.map(({ id }) => ({ type: 'Files' as const, id })),
              { type: 'Files', id: 'LIST' },
            ]
          : [{ type: 'Files', id: 'LIST' }],
    }),
    getFile: builder.query<ApiResponse<FileMetadata>, string>({
      query: (id) => `/files/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Files', id }],
    }),
    uploadFile: builder.mutation<
      ApiResponse<FileMetadata>,
      { file: File; projectId: string; folderId?: string; visibility?: string }
    >({
      query: ({ file, projectId, folderId, visibility }) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('projectId', projectId);
        if (folderId) formData.append('folderId', folderId);
        if (visibility) formData.append('visibility', visibility);
        return {
          url: '/files/upload',
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: [{ type: 'Files', id: 'LIST' }],
    }),
    updateFile: builder.mutation<
      ApiResponse<FileMetadata>,
      { id: string; body: UpdateFileMetadataRequest }
    >({
      query: ({ id, body }) => ({
        url: `/files/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Files', id }],
    }),
    deleteFile: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({
        url: `/files/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Files', id: 'LIST' }],
    }),
    getSignedUrl: builder.mutation<
      ApiResponse<SignedUrl>,
      { fileId: string; body: CreateSignedUrlRequest }
    >({
      query: ({ fileId, body }) => ({
        url: `/files/${fileId}/signed-url`,
        method: 'POST',
        body,
      }),
    }),
    getDownloadUrl: builder.query<void, string>({
      query: (id) => `/files/${id}/download`,
    }),
  }),
});

export const {
  useGetFilesQuery,
  useGetFileQuery,
  useUploadFileMutation,
  useUpdateFileMutation,
  useDeleteFileMutation,
  useGetSignedUrlMutation,
  useGetDownloadUrlQuery,
} = filesApi;
