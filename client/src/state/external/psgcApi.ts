import { externalApi } from "@/state/externalApi";
import { Region, Province, City, Barangay } from "@/types/pages/Psgc";

const baseURL = "https://psgc.gitlab.io/api";

export const psgcApi = externalApi.injectEndpoints({
  endpoints: (builder) => ({
    getRegions: builder.query<Region[], void>({
      query: () => ({
        url: `${baseURL}/regions/`,
        method: "GET",
      }),
      keepUnusedDataFor: 60 * 60,
    }),
    getProvinces: builder.query<Province[], string>({
      query: (regionCode) => ({
        url: `${baseURL}/regions/${regionCode}/provinces/`,
        method: "GET",
      }),
      keepUnusedDataFor: 60 * 60,
    }),
    getCities: builder.query<City[], string>({
      query: (provinceCode) => ({
        url: `${baseURL}/provinces/${provinceCode}/cities-municipalities/`,
        method: "GET",
      }),
      keepUnusedDataFor: 60 * 60,
    }),
    getBarangays: builder.query<Barangay[], string>({
      query: (cityCode) => ({
        url: `${baseURL}/cities-municipalities/${cityCode}/barangays/`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useGetRegionsQuery,
  useGetProvincesQuery,
  useGetCitiesQuery,
  useGetBarangaysQuery,
} = psgcApi;
