import { z } from 'zod';

import { api } from './api';

export interface ILoginRequest {
  username: string;
  password: string;
}

export interface IMeResponse {
  username: string;
}

const meResponseSchema = z.object({ username: z.string() });

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<IMeResponse, ILoginRequest>({
      query: (credentials) => ({
        url: '/api/auth/login',
        method: 'POST',
        body: credentials,
      }),
      transformResponse: (raw: unknown) => meResponseSchema.parse(raw),
    }),

    logout: builder.mutation<void, void>({
      query: () => ({
        url: '/api/auth/logout',
        method: 'POST',
      }),
    }),

    getMe: builder.query<IMeResponse, void>({
      query: () => '/api/auth/me',
      transformResponse: (raw: unknown) => meResponseSchema.parse(raw),
    }),
  }),
});

export const { useLoginMutation, useLogoutMutation, useGetMeQuery } = authApi;
