import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { ApiResponse, LoginRequest, AuthSession } from '@/types';
import { API_BASE_URL } from '@/constants';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    credentials: 'include',
  }),
  tagTypes: ['Auth'],
  endpoints: (builder) => ({
    login: builder.mutation<ApiResponse<AuthSession>, LoginRequest>({
      query: (body) => ({
        url: '/auth/login',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Auth'],
    }),
    logout: builder.mutation<ApiResponse<null>, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      invalidatesTags: ['Auth'],
    }),
    getSession: builder.query<ApiResponse<AuthSession>, void>({
      query: () => '/auth/session',
      providesTags: ['Auth'],
    }),
  }),
});

export const { useLoginMutation, useLogoutMutation, useGetSessionQuery } = authApi;
