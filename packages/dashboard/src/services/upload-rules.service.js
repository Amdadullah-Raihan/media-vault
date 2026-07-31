import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '@/constants';
export const uploadRulesApi = createApi({
    reducerPath: 'uploadRulesApi',
    baseQuery: fetchBaseQuery({
        baseUrl: API_BASE_URL,
        credentials: 'include',
    }),
    tagTypes: ['UploadRules'],
    endpoints: (builder) => ({
        getUploadRules: builder.query({
            query: () => '/upload-rules',
            transformResponse: (response) => response.data,
            providesTags: ['UploadRules'],
        }),
        updateCategory: builder.mutation({
            query: ({ category, ...body }) => ({
                url: `/upload-rules/category/${category}`,
                method: 'PATCH',
                body,
            }),
            invalidatesTags: ['UploadRules'],
        }),
        updateExtension: builder.mutation({
            query: ({ category, extension, ...body }) => ({
                url: `/upload-rules/extension/${category}/${extension}`,
                method: 'PATCH',
                body,
            }),
            invalidatesTags: ['UploadRules'],
        }),
    }),
});
export const { useGetUploadRulesQuery, useUpdateCategoryMutation, useUpdateExtensionMutation } = uploadRulesApi;
//# sourceMappingURL=upload-rules.service.js.map