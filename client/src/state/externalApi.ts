import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react'

export const externalApi = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: '' }),
  reducerPath: 'externalApi',
  endpoints: (builder) => ({}),
})