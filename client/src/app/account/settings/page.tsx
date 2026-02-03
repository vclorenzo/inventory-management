'use client';
import { mockPreferencesSettings } from '@/app/constants/User';
import Header from '@/components/Header';
import { UserSetting } from '@/types/User';
import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/redux';
import { setIsDarkModeVisible, setIsNotificationVisible } from '@/state';

const Preferences = () => {
	//Selectors
	const isNotificationVisible = useAppSelector(
		(state) => state.global.isNotificationVisible,
	);

	const isDarkModeVisible = useAppSelector(
		(state) => state.global.isDarkModeVisible,
	);

	//PRESET
	mockPreferencesSettings[0].value = isNotificationVisible;
	mockPreferencesSettings[1].value = isDarkModeVisible;

	const [preferencesSettings, setPreferencesSettings] = useState<UserSetting[]>(
		mockPreferencesSettings,
	);

	const dispatch = useAppDispatch();

	const handleToggleChange = (index: number) => {
		const settingsCopy = [...preferencesSettings];
		switch (index) {
			case 0:
				dispatch(setIsNotificationVisible(!isNotificationVisible));
				settingsCopy[index].value = isNotificationVisible;
				break;
			case 1:
				dispatch(setIsDarkModeVisible(!isDarkModeVisible));
				settingsCopy[index].value = isDarkModeVisible;
				break;
		}
		// settingsCopy[index].value = !settingsCopy[index].value as boolean;

		setPreferencesSettings(settingsCopy);
	};

	console.log('ITLOG', preferencesSettings);

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
						{preferencesSettings.map((setting, index) => (
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
											onChange={(e) => {
												const settingsCopy = [...preferencesSettings];
												settingsCopy[index].value = e.target.value;
												setPreferencesSettings(settingsCopy);
											}}
										/>
									)}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
};

export default Preferences;
