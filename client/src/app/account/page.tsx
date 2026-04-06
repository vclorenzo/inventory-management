'use client';
import Cards from '@/components/Cards';
import Header from '@/components/Header';
import Tabs from '@/components/Tabs';
import { UserSetting } from '@/types/User';
import { useState } from 'react';
import { mockAccountSettings } from '../constants/User';
import { useGetProductsQuery } from '@/state/internal/productsApi';
import { CircularProgress } from '@mui/material';

const Account = () => {
	const [userSettings, setUserSettings] =
		useState<UserSetting[]>(mockAccountSettings);

	const [searchTerm, setSearchTerm] = useState('');

	const {
		data: products,
		isLoading,
		isError,
	} = useGetProductsQuery(searchTerm);

	const handleToggleChange = (index: number) => {
		const settingsCopy = [...userSettings];
		settingsCopy[index].value = !settingsCopy[index].value as boolean;
		setUserSettings(settingsCopy);
	};

	if (isError || !products) {
		return (
			<div className="text-center text-red-500 py-4">
				Failed to fetch products
			</div>
		);
	}

	return (
		<div className="w-full">
			<Header name="Account" />
			<div className="overflow-x-auto mt-5 shadow-md">
				<table className="min-w-full bg-white rounded-lg">
					<thead className="bg-gray-800 text-white">
						<tr>
							<th className="text-left py-3 px-4 uppercase font-semibold text-sm">
								Setting
							</th>
							<th className="text-left py-3 px-4 uppercase font-semibold text-sm">
								Value
							</th>
						</tr>
					</thead>
					<tbody>
						{userSettings.map((setting, index) => (
							<tr className="hover:bg-blue-50" key={setting.label}>
								<td className="py-2 px-4">{setting.label}</td>
								<td className="py-2 px-4">
									{setting.type === 'toggle' ? (
										<label className="inline-flex relative items-center cursor-pointer">
											<input
												type="checkbox"
												className="sr-only peer"
												checked={setting.value as boolean}
												onChange={() => handleToggleChange(index)}
											/>
											<div
												className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-blue-400 peer-focus:ring-4 
                        transition peer-checked:after:translate-x-full peer-checked:after:border-white 
                        after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white 
                        after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all
                        peer-checked:bg-blue-600"
											></div>
										</label>
									) : (
										<input
											type="text"
											className="px-4 py-2 border rounded-lg text-gray-500 focus:outline-none focus:border-blue-500"
											value={setting.value as string}
											disabled
											onChange={(e) => {
												const settingsCopy = [...userSettings];
												settingsCopy[index].value = e.target.value;
												setUserSettings(settingsCopy);
											}}
										/>
									)}
								</td>
							</tr>
						))}
					</tbody>
				</table>
				<Tabs
					tabs={[
						{
							label: 'Listings',
							content: (
								<div className="grid grid-cols-1 sm:grid-cols-2 lg-grid-cols-3 gap-10 justify-between">
									{isLoading ? (
										<>
											<CircularProgress />
										</>
									) : (
										<Cards products={products} />
									)}
								</div>
							),
						},
						{ label: 'Reviews', content: <div>Reviews content</div> },
					]}
				/>
			</div>
		</div>
	);
};

export default Account;
