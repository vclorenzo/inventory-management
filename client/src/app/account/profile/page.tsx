'use client';
import { mockProfileSettings } from '@/app/constants/User';
import Button from '@/components/Button';
import Header from '@/components/Header';
import { useAdressDropdowns } from '@/hooks/useAddressDropdown';
import { UserFormValues, UserSetting } from '@/types/User';
import { CircularProgress } from '@mui/material';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

const Profile = () => {
	const [profileSettings, setProfileSettings] =
		useState<UserSetting[]>(mockProfileSettings);

	const [region, setRegion] = useState<string>();
	const [province, setProvince] = useState<string>();
	const [city, setCity] = useState<string>();

	//=================================================================================
	const handleChangeRegion = (e: any) => {
		const value = e.target.value || undefined;
		setRegion(value);
		setProvince(undefined);
		setCity(undefined);
		setValue?.('province', '');
		setValue?.('city', '');
		setValue?.('barangay', '');
	};

	const handleChangeProvince = (e: any) => {
		const value = e.target.value || undefined;
		setProvince(value);
		setCity(undefined);
		setValue?.('city', '');
		setValue?.('barangay', '');
	};

	const handleChangeCity = (e: any) => {
		const value = e.target.value || undefined;
		setCity(value);
		setValue?.('barangay', '');
	};

	// RHF
	const form = useForm<UserFormValues>();
	const { register, handleSubmit, setValue } = form;

	const onSubmit = (data: UserFormValues) => {
		console.log('ITLOG', data);
	};

	const { regions, provinces, cities, barangays, isLoading, error } =
		useAdressDropdowns({
			regionCode: region,
			provinceCode: province,
			cityCode: city,
		});

	if (isLoading) {
		return (
			<div className="py-4">
				<CircularProgress />
			</div>
		);
	}

	if (error) {
		return (
			<div className="text-center text-red-500 py-4">
				Failed to fetch products
			</div>
		);
	}

	console.log('ITLOG', regions, provinces, cities, barangays);

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
						<form
							className="flex flex-col gap-3 p-10 w-[fit-content]"
							onSubmit={handleSubmit(onSubmit)}
						>
							<div className="flex flex-row justify-start items-center">
								<label htmlFor="username" className="min-w-[200px]">
									Username
								</label>
								<input
									type="text"
									className="px-4 py-2 border rounded-lg text-gray-500 focus:outline-none focus:border-blue-500 min-w-[336px]"
									// value={setting.value as string}
									id="username"
									{...register('username')}
								/>
							</div>
							<div className="flex flex-row justify-start items-center">
								<label htmlFor="email" className="min-w-[200px]">
									Email
								</label>
								<input
									type="text"
									className="px-4 py-2 border rounded-lg text-gray-500 focus:outline-none focus:border-blue-500 min-w-[336px]"
									id="email"
									{...register('email')}
								/>
							</div>

							{/* ======================================================== */}
							<div className="flex flex-row justify-start items-center">
								<label htmlFor="region" className="min-w-[200px]">
									Region
								</label>
								<div className="w-full max-w-sm min-w-[200px]">
									<div className="relative">
										<select
											className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded pl-3 pr-8 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-400 shadow-sm focus:shadow-md appearance-none cursor-pointer"
											{...register('region', {
												onChange: handleChangeRegion,
											})}
										>
											<option value="">Select Region</option>
											{regions.data?.map((region) => (
												<option key={region.code} value={region.code}>
													{region.name}
												</option>
											))}
										</select>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											fill="none"
											viewBox="0 0 24 24"
											stroke-width="1.2"
											stroke="currentColor"
											className="h-5 w-5 ml-1 absolute top-2.5 right-2.5 text-slate-700"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												d="M8.25 15 12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"
											/>
										</svg>
									</div>
								</div>
							</div>
							<div className="flex flex-row justify-start items-center">
								<label htmlFor="province" className="min-w-[200px]">
									Province
								</label>
								<div className="w-full max-w-sm min-w-[200px]">
									<div className="relative">
										<select
											className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded pl-3 pr-8 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-400 shadow-sm focus:shadow-md appearance-none cursor-pointer"
											disabled={!region}
											{...register('province', {
												onChange: handleChangeProvince,
											})}
										>
											<option value="">Select Province</option>
											{provinces.data?.map((province) => (
												<option key={province.code} value={province.code}>
													{province.name}
												</option>
											))}
										</select>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											fill="none"
											viewBox="0 0 24 24"
											stroke-width="1.2"
											stroke="currentColor"
											className="h-5 w-5 ml-1 absolute top-2.5 right-2.5 text-slate-700"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												d="M8.25 15 12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"
											/>
										</svg>
									</div>
								</div>
							</div>
							<div className="flex flex-row justify-start items-center">
								<label htmlFor="city" className="min-w-[200px]">
									City
								</label>
								<div className="w-full max-w-sm min-w-[200px]">
									<div className="relative">
										<select
											className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded pl-3 pr-8 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-400 shadow-sm focus:shadow-md appearance-none cursor-pointer"
											disabled={!province}
											{...register('city', {
												onChange: handleChangeCity,
											})}
										>
											<option value="">Select City</option>
											{cities.data?.map((city) => (
												<option key={city.code} value={city.code}>
													{city.name}
												</option>
											))}
										</select>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											fill="none"
											viewBox="0 0 24 24"
											stroke-width="1.2"
											stroke="currentColor"
											className="h-5 w-5 ml-1 absolute top-2.5 right-2.5 text-slate-700"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												d="M8.25 15 12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"
											/>
										</svg>
									</div>
								</div>
							</div>
							<div className="flex flex-row justify-start items-center">
								<label htmlFor="barangay" className="min-w-[200px]">
									Barangay
								</label>
								<div className="w-full max-w-sm min-w-[200px]">
									<div className="relative">
										<select
											className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded pl-3 pr-8 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-400 shadow-sm focus:shadow-md appearance-none cursor-pointer"
											disabled={!city}
											{...register('barangay')}
										>
											<option value="">Select Barangay</option>
											{barangays.data?.map((barangay) => (
												<option key={barangay.code} value={barangay.code}>
													{barangay.name}
												</option>
											))}
										</select>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											fill="none"
											viewBox="0 0 24 24"
											stroke-width="1.2"
											stroke="currentColor"
											className="h-5 w-5 ml-1 absolute top-2.5 right-2.5 text-slate-700"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												d="M8.25 15 12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"
											/>
										</svg>
									</div>
								</div>
							</div>
							<div className="flex w-full justify-end items-center">
								<Button
									text="Save"
									variant="filled"
									onClick={() => {
										console.log('Hello');
									}}
								/>
							</div>
						</form>
					</div>
				</tbody>
			</table>
		</div>
	);
};

export default Profile;
