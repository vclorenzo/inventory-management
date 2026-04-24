import type { ReusableFieldConfig, SelectOption } from '@/types/components/ReactHookForm'
import type { UserFormValues } from '@/types/User'
import type { ChangeEvent } from 'react'

type Args = {
	regionOptions: SelectOption[]
	provinceOptions: SelectOption[]
	cityOptions: SelectOption[]
	barangayOptions: SelectOption[]
	isRegionSelected: boolean
	isProvinceSelected: boolean
	isCitySelected: boolean
	regionValue: string
	provinceValue: string
	cityValue: string
	handleChangeRegion: (
		e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
	) => void
	handleChangeProvince: (
		e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
	) => void
	handleChangeCity: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void
}

export function buildProfileFields({
	regionOptions,
	provinceOptions,
	cityOptions,
	barangayOptions,
	isRegionSelected,
	isProvinceSelected,
	isCitySelected,
	regionValue,
	provinceValue,
	cityValue,
	handleChangeRegion,
	handleChangeProvince,
	handleChangeCity,
}: Args): ReusableFieldConfig<UserFormValues>[] {
	return [
		{
			name: 'name',
			label: 'Name',
			type: 'text',
			rules: {
				required: 'Name is required',
				minLength: { value: 2, message: 'Name must be at least 2 characters' },
			},
		},
		{
			name: 'email',
			label: 'Email',
			type: 'email',
			autoComplete: 'email',
			rules: {
				required: 'Email is required',
				pattern: {
					value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
					message: 'Enter a valid email address',
				},
			},
		},
		{
			name: 'region',
			label: 'Region',
			type: 'select',
			placeholder: 'Select Region',
			options: regionOptions,
			onChange: handleChangeRegion,
		},
		{
			name: 'province',
			label: 'Province',
			type: 'select',
			placeholder: 'Select Province',
			options: provinceOptions,
			disabled: !isRegionSelected,
			rules: {
				validate: (v: string) => {
					if (!regionValue) return true
					return v ? true : 'Province is required when a region is selected'
				},
			},
			onChange: handleChangeProvince,
		},
		{
			name: 'city',
			label: 'City',
			type: 'select',
			placeholder: 'Select City',
			options: cityOptions,
			disabled: !isProvinceSelected,
			rules: {
				validate: (v: string) => {
					if (!provinceValue) return true
					return v ? true : 'City is required when a province is selected'
				},
			},
			onChange: handleChangeCity,
		},
		{
			name: 'barangay',
			label: 'Barangay',
			type: 'select',
			placeholder: 'Select Barangay',
			options: barangayOptions,
			disabled: !isCitySelected,
			rules: {
				validate: (v: string) => {
					if (!cityValue) return true
					return v ? true : 'Barangay is required when a city is selected'
				},
			},
		},
	]
}