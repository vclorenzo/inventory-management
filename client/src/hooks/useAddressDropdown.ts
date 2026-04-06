import {
	useGetRegionsQuery,
	useGetProvincesQuery,
	useGetCitiesQuery,
	useGetBarangaysQuery,
} from '@/state/external/psgcApi';

type Params = {
	regionCode?: string;
	provinceCode?: string;
	cityCode?: string;
};

export function useAdressDropdowns({
	regionCode,
	provinceCode,
	cityCode,
}: Params) {
	const regions = useGetRegionsQuery();

	const provinces = useGetProvincesQuery(regionCode!, {
		skip: !regionCode,
	});
	const cities = useGetCitiesQuery(provinceCode!, {
		skip: !provinceCode,
	});
	const barangays = useGetBarangaysQuery(cityCode!, {
		skip: !cityCode,
	});

	return {
		regions,
		provinces,
		cities,
		barangays,
		isLoading:
			regions.isLoading ||
			provinces.isLoading ||
			cities.isLoading ||
			barangays.isLoading,
		error:
			regions.isError ||
			provinces.isError ||
			cities.isError ||
			barangays.isError,
	};
}
