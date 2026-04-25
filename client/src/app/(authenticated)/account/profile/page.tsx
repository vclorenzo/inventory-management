'use client';
import Header from '@/components/Header';
import ReactHookForm from '@/components/forms/ReactHookForm';
import { useAdressDropdowns } from '@/hooks/useAddressDropdown';
import { useMe } from '@/hooks/useMe';
import { useProfile } from '@/hooks/useProfile';
import { useUpdateProfileMutation } from '@/state/internal/profileApi';
import {
	ReusableFieldConfig,
	SelectOption,
} from '@/types/components/ReactHookForm';
import { UserFormValues } from '@/types/pages/User';
import { buildProfileFields } from '@/constants/ProfileForm';
import { CircularProgress } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

const Profile = () => {
	const [updateProfile, { isLoading: isUpdateLoading }] =
		useUpdateProfileMutation();
	const { me, isLoading: isMeLoading } = useMe();
	const userId = me?.data.userId;

	const {
		profile,
		isLoading: isProfileLoading,
		error: hasProfileError,
	} = useProfile(userId ?? '');

	const [region, setRegion] = useState<string>();
	const [province, setProvince] = useState<string>();
	const [city, setCity] = useState<string>();

	//=================================================================================
	const handleChangeRegion = useMemo(
		() => (e: any) => {
			const value = e.target.value || undefined;
			setRegion(value);
			setProvince(undefined);
			setCity(undefined);
			setValue?.('province', '');
			setValue?.('city', '');
			setValue?.('barangay', '');
		},
		[],
	);

	const handleChangeProvince = useMemo(
		() => (e: any) => {
			const value = e.target.value || undefined;
			setProvince(value);
			setCity(undefined);
			setValue?.('city', '');
			setValue?.('barangay', '');
		},
		[],
	);

	const handleChangeCity = useMemo(
		() => (e: any) => {
			const value = e.target.value || undefined;
			setCity(value);
			setValue?.('barangay', '');
		},
		[],
	);

	// RHF
	const form = useForm<UserFormValues>();
	const { setValue, reset, watch } = form;

	useEffect(() => {
		if (!profile) return;
		const r = profile.region ?? '';
		const p = profile.province ?? '';
		const c = profile.city ?? '';
		const b = profile.barangay ?? '';
		setRegion(r || undefined);
		setProvince(p || undefined);
		setCity(c || undefined);
		reset({
			name: profile.name ?? '',
			email: profile.email ?? '',
			region: r,
			province: p,
			city: c,
			barangay: b,
		});
	}, [profile, reset]);

	const onSubmit = (data: UserFormValues) => {
		if (!userId) return;
		const { name, region, province, city, barangay } = data;
		updateProfile({ userId, name, region, province, city, barangay });
	};

	const {
		regions,
		provinces,
		cities,
		barangays,
		isLoading: isAddressLoading,
		error: hasAddressError,
	} = useAdressDropdowns({
		regionCode: region,
		provinceCode: province,
		cityCode: city,
	});

	const regionValue = watch('region');
	const provinceValue = watch('province');
	const cityValue = watch('city');

	const regionOptions: SelectOption[] = useMemo(
		() => regions.data?.map((r) => ({ value: r.code, label: r.name })) ?? [],
		[regions.data],
	);

	const provinceOptions: SelectOption[] = useMemo(
		() => provinces.data?.map((p) => ({ value: p.code, label: p.name })) ?? [],
		[provinces.data],
	);

	const cityOptions: SelectOption[] = useMemo(
		() => cities.data?.map((c) => ({ value: c.code, label: c.name })) ?? [],
		[cities.data],
	);

	const barangayOptions: SelectOption[] = useMemo(
		() => barangays.data?.map((b) => ({ value: b.code, label: b.name })) ?? [],
		[barangays.data],
	);

	const fields: ReusableFieldConfig<UserFormValues>[] = useMemo(
		() =>
			buildProfileFields({
				regionOptions,
				provinceOptions,
				cityOptions,
				barangayOptions,
				isRegionSelected: Boolean(region),
				isProvinceSelected: Boolean(province),
				isCitySelected: Boolean(city),
				regionValue,
				provinceValue,
				cityValue,
				handleChangeRegion,
				handleChangeProvince,
				handleChangeCity,
			}),
		[
			barangayOptions,
			city,
			cityOptions,
			cityValue,
			handleChangeCity,
			handleChangeProvince,
			handleChangeRegion,
			province,
			provinceOptions,
			provinceValue,
			region,
			regionOptions,
			regionValue,
		],
	);

	if (isMeLoading || isProfileLoading || isAddressLoading || isUpdateLoading) {
		return (
			<div className="py-4">
				<CircularProgress />
			</div>
		);
	}

	if (hasProfileError || hasAddressError) {
		return (
			<div className="text-center text-red-500 py-4">
				Failed to fetch products
			</div>
		);
	}

	console.log('ITLOG', me, profile);

	return (
		<div className="w-full">
			<Header name="Profile" />
			<table className="min-w-full bg-white rounded-lg">
				<thead className="bg-gray-800 text-white">
					<tr>
						<th className="text-left py-3 px-4 uppercase font-semibold text-sm">
							Profile Details
						</th>
					</tr>
				</thead>
				<tbody>
					<div className="overflow-x-auto mt-5 shadow-md">
						<div className="p-10 w-[fit-content]">
							<ReactHookForm
								form={form}
								fields={fields}
								onSubmit={onSubmit}
								submitLabel="Save"
								isSubmitting={isUpdateLoading}
							/>
						</div>
					</div>
				</tbody>
			</table>
		</div>
	);
};

export default Profile;
