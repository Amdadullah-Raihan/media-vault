import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '@/constants';
export const projectsApi = createApi({
    reducerPath: 'projectsApi',
    baseQuery: fetchBaseQuery({
        baseUrl: API_BASE_URL,
        credentials: 'include',
    }),
    tagTypes: ['Projects'],
    endpoints: (builder) => ({
        getProjects: builder.query({
            query: (params) => ({
                url: '/projects',
                params: params ?? {},
            }),
            providesTags: (result) => result
                ? [
                    ...result.data.data.map(({ id }) => ({ type: 'Projects', id })),
                    { type: 'Projects', id: 'LIST' },
                ]
                : [{ type: 'Projects', id: 'LIST' }],
        }),
        getProject: builder.query({
            query: (id) => `/projects/${id}`,
            providesTags: (_result, _error, id) => [{ type: 'Projects', id }],
        }),
        createProject: builder.mutation({
            query: (body) => ({
                url: '/projects',
                method: 'POST',
                body,
            }),
            invalidatesTags: [{ type: 'Projects', id: 'LIST' }],
        }),
        updateProject: builder.mutation({
            query: ({ id, body }) => ({
                url: `/projects/${id}`,
                method: 'PATCH',
                body,
            }),
            invalidatesTags: (_result, _error, { id }) => [{ type: 'Projects', id }],
        }),
        deleteProject: builder.mutation({
            query: (id) => ({
                url: `/projects/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: [{ type: 'Projects', id: 'LIST' }],
        }),
    }),
});
export const { useGetProjectsQuery, useGetProjectQuery, useCreateProjectMutation, useUpdateProjectMutation, useDeleteProjectMutation, } = projectsApi;
//# sourceMappingURL=projects.service.js.map