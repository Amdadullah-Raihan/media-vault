import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '@/constants';

export interface ExtensionRule {
  extension: string;
  enabled: boolean;
  maxSize: number | null;
}

export interface CategoryWithExtensions {
  category: string;
  label: string;
  enabled: boolean;
  maxSize: number;
  extensions: ExtensionRule[];
}

interface UploadRulesResponse {
  categories: CategoryWithExtensions[];
}

export const uploadRulesApi = createApi({
  reducerPath: 'uploadRulesApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    credentials: 'include',
  }),
  tagTypes: ['UploadRules'],
  endpoints: (builder) => ({
    getUploadRules: builder.query<UploadRulesResponse, void>({
      query: () => '/upload-rules',
      transformResponse: (response: { success: boolean; data: UploadRulesResponse }) =>
        response.data,
      providesTags: ['UploadRules'],
    }),
    updateCategory: builder.mutation<
      unknown,
      { category: string; enabled?: boolean; maxSize?: number }
    >({
      query: ({ category, ...body }) => ({
        url: `/upload-rules/category/${category}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['UploadRules'],
    }),
    updateExtension: builder.mutation<
      unknown,
      { category: string; extension: string; enabled?: boolean; maxSize?: number | null }
    >({
      query: ({ category, extension, ...body }) => ({
        url: `/upload-rules/extension/${category}/${extension}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['UploadRules'],
    }),
  }),
});

export const { useGetUploadRulesQuery, useUpdateCategoryMutation, useUpdateExtensionMutation } =
  uploadRulesApi;
