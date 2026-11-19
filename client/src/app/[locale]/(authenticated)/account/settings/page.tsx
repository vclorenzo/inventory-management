'use client'

import Header from '@/components/Header'
import SectionCard from '@/components/SectionCard'
import { useAppDispatch, useAppSelector } from '@/state/redux'
import { UserSetting } from '@/types/pages/User'
import { toggleDarkMode } from '@/utils/global'
import { setIsNotificationBubbleEnabled } from '@/state'
import { useState } from 'react'
import { mockPreferencesSettings } from '../../constants/User'
import LanguageSwitcher from '@/components/LanguageSwitcher'

const Preferences = () => {
	const [preferencesSettings, setPreferencesSettings] = useState<UserSetting[]>(
		mockPreferencesSettings,
	)

	const dispatch = useAppDispatch()
	const isDarkMode = useAppSelector((state) => state.global.isDarkMode)
	const isNotificationBubbleEnabled = useAppSelector(
		(state) => state.global.isNotificationBubbleEnabled !== false,
	)

	const handleToggleChange = (index: number) => {
		const settingsCopy = [...preferencesSettings]
		switch (index) {
			case 0:
				toggleDarkMode(dispatch, isDarkMode)
				break
			case 1:
				dispatch(setIsNotificationBubbleEnabled(!isNotificationBubbleEnabled))
				break
		}

		setPreferencesSettings(settingsCopy)
	}

	return (
		<div className="flex w-full flex-col items-center">
			<div className="flex w-full max-w-2xl flex-col gap-4">
				<Header name="Settings" />
				<SectionCard title="Preferences">
					<ul className="flex flex-col gap-4">
						{preferencesSettings.map((setting, index) => (
							<li
								key={setting.label}
								className="flex items-center justify-between gap-4 border-b border-gray-200 pb-4 last:border-b-0 last:pb-0"
							>
								<label
									htmlFor={`setting-${index}`}
									className="text-sm font-medium text-gray-800"
								>
									{setting.label}
								</label>
								{setting.type === 'toggle' ? (
									<label className="relative inline-flex cursor-pointer items-center">
										<input
											id={`setting-${index}`}
											type="checkbox"
											className="peer sr-only"
											checked={
												setting.label === 'Dark Mode'
													? isDarkMode
													: setting.label === 'Notification'
														? isNotificationBubbleEnabled
														: (setting.value as boolean)
											}
											onChange={() => handleToggleChange(index)}
										/>
										<div className="h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-4 peer-focus:ring-blue-400" />
									</label>
								) : (
									<LanguageSwitcher isLocale={false} />
								)}
							</li>
						))}
					</ul>
				</SectionCard>
			</div>
		</div>
	)
}

export default Preferences
