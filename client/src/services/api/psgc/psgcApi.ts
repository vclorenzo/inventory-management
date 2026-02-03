import { externalApi } from '@/state/externalApi';
import { Region, Province, City, Barangay } from '@/types/Psgc';

const baseURL = 'https://psgc.gitlab.io/api';

export const psgcApi = externalApi.injectEndpoints({
	endpoints: (builder) => ({
		getRegions: builder.query<Region[], void>({
			query: () => ({
				url: `${baseURL}/regions/`,
				method: 'GET',
			}),
			keepUnusedDataFor: 60 * 60,
		}),
		getProvinces: builder.query<Province[], void>({
			query: (regionCode) => ({
				url: `${baseURL}/regions/${regionCode}/provinces/`,
				method: 'GET',
			}),
			keepUnusedDataFor: 60 * 60,
		}),
		getCities: builder.query<City[], void>({
			query: (districtCode) => ({
				url: `${baseURL}/districts/${districtCode}/cities/`,
				method: 'GET',
			}),
			keepUnusedDataFor: 60 * 60,
		}),
		getBarangays: builder.query<Barangay[], void>({
			query: (cityCode) => ({
				url: `${baseURL}/cities/${cityCode}/barangays/`,
				method: 'GET',
			}),
		}),
	}),
});

export const { useGetRegionsQuery } = psgcApi;
