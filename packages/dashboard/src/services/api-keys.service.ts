import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { ApiResponse, ApiKey, CreateApiKeyRequest, CreateApiKeyResponse } from '@/types';
import { API_BASE_URL } from '@/constants';

export const apiKeysApi = createApi({
  reducerPath: 'apiKeysApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    credentials: 'include',
  }),
  tagTypes: ['ApiKeys'],
  endpoints: (builder) => ({
    getApiKeys: builder.query<ApiResponse<ApiKey[]>, string | void>({
      query: (projectId) => ({
        url: '/api-keys',
        params: projectId ? { projectId } : {},
      }),
      providesTags: ['ApiKeys'],
    }),
    createApiKey: builder.mutation<ApiResponse<CreateApiKeyResponse>, CreateApiKeyRequest>({
      query: (body) => ({
        url: '/api-keys',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['ApiKeys'],
    }),
    revokeApiKey: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({
        url: `/api-keys/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ApiKeys'],
    }),
  }),
});

export const { useGetApiKeysQuery, useCreateApiKeyMutation, useRevokeApiKeyMutation } = apiKeysApi;
