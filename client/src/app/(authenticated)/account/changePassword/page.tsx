'use client';
import Header from '@/components/Header';
import { ChangePasswordFormValues, UserSetting } from '@/types/User';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { mockChangePAsswordSettings } from '../../constants/User';

const ChangePassword = () => {
	const [ChangePasswordSettings, setChangePasswordSettings] = useState<
		UserSetting[]
	>(mockChangePAsswordSettings);

	const form = useForm<ChangePasswordFormValues>();
	const { register, handleSubmit } = form;

	const onSubmit = (data: any) => {
		console.log('ITLOG', data);
	};
	return (
		<div className="w-full">
			<Header name="Change Password" />
			<div className="overflow-x-auto mt-5 shadow-md">
				<table className="min-w-full bg-white rounded-lg">
					<thead className="bg-gray-800 text-white">
						<tr>
							<th className="text-left py-3 px-4 uppercase font-semibold text-sm">
								Password Details
							</th>
						</tr>
					</thead>
					<tbody>
						<div className="overflow-x-auto mt-5 shadow-md">
							<form
								className="flex flex-col w-full gap-3"
								onSubmit={handleSubmit(onSubmit)}
							>
								<div className="flex flex-row justify-between items-center">
									<label htmlFor="oldPassword">Old Password</label>
									<input
										type="text"
										className="px-4 py-2 border rounded-lg text-gray-500 focus:outline-none focus:border-blue-500 min-w-[336px]"
										// value={setting.value as string}
										id="oldPassword"
										{...register('oldPassword')}
									/>
								</div>
								<div className="flex flex-row justify-between items-center">
									<label htmlFor="newPassword">New Password</label>
									<input
										type="text"
										className="px-4 py-2 border rounded-lg text-gray-500 focus:outline-none focus:border-blue-500 min-w-[336px]"
										id="newPassword"
										{...register('newPassword')}
									/>
								</div>
								<div className="flex flex-row justify-between items-center">
									<label htmlFor="confirmPassword">Confirm Password</label>
									<input
										type="text"
										className="px-4 py-2 border rounded-lg text-gray-500 focus:outline-none focus:border-blue-500 min-w-[336px]"
										id="confirmPassword"
										{...register('confirmPassword')}
									/>
								</div>

								<button
									type="submit"
									className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
								>
									Save
								</button>
							</form>
						</div>
					</tbody>
				</table>
			</div>
		</div>
	);
};

export default ChangePassword;
