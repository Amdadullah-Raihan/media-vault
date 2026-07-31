import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '@/constants';
export const settingsApi = createApi({
    reducerPath: 'settingsApi',
    baseQuery: fetchBaseQuery({
        baseUrl: API_BASE_URL,
        credentials: 'include',
    }),
    tagTypes: ['Settings'],
    endpoints: (builder) => ({
        getSettings: builder.query({
            query: () => '/settings',
            providesTags: ['Settings'],
        }),
        updateSettings: builder.mutation({
            query: (body) => ({
                url: '/settings',
                method: 'PATCH',
                body,
            }),
            invalidatesTags: ['Settings'],
        }),
    }),
});
export const { useGetSettingsQuery, useUpdateSettingsMutation } = settingsApi;
//# sourceMappingURL=settings.service.js.map