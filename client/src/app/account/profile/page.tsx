'use client';
import { mockProfileSettings } from '@/app/constants/User';
import Button from '@/components/Button';
import Header from '@/components/Header';
import { useGetRegionsQuery } from '@/services/api/psgc/psgcApi';
import { UserFormValues, UserSetting } from '@/types/User';
import { use, useState } from 'react';
import { useForm } from 'react-hook-form';

const Profile = () => {
	const { data: islands, isLoading, isError } = useGetRegionsQuery();

	const [profileSettings, setProfileSettings] =
		useState<UserSetting[]>(mockProfileSettings);

	// RHF
	const form = useForm<UserFormValues>();
	const { register, handleSubmit } = form;

	const onSubmit = (data: UserFormValues) => {
		console.log('ITLOG', data);
	};
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
							<div className="flex flex-row justify-start items-center">
								<label htmlFor="country" className="min-w-[200px]">
									Country
								</label>
								<div className="w-full max-w-sm min-w-[200px]">
									<div className="relative">
										<select
											className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded pl-3 pr-8 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-400 shadow-sm focus:shadow-md appearance-none cursor-pointer"
											{...register('country')}
										>
											{/* <option value="brazil">Brazil</option>
											<option value="bucharest">Bucharest</option>
											<option value="london">London</option>
											<option value="washington">Washington</option> */}
											{islands?.map((island) => (
												<option key={island.name} value={island.name}>
													{island.name}
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
								<label htmlFor="region" className="min-w-[200px]">
									Region
								</label>
								<div className="w-full max-w-sm min-w-[200px]">
									<div className="relative">
										<select
											className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded pl-3 pr-8 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-400 shadow-sm focus:shadow-md appearance-none cursor-pointer"
											{...register('region')}
										>
											<option value="brazil">Brazil</option>
											<option value="bucharest">Bucharest</option>
											<option value="london">London</option>
											<option value="washington">Washington</option>
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
											{...register('city')}
										>
											<option value="brazil">Brazil</option>
											<option value="bucharest">Bucharest</option>
											<option value="london">London</option>
											<option value="washington">Washington</option>
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
