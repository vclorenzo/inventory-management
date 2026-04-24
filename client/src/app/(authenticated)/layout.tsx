'use client';

import React, { useEffect } from 'react';
import { useMe } from '@/hooks/useMe';
import { useAppSelector } from '@/state/redux';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import { CircularProgress } from '@mui/material';
import { useRouter } from 'next/navigation';

type Props = {
	children: React.ReactNode;
};

const DashboardLayout = ({ children }: Props) => {
	const router = useRouter();
	const isSidebarCollapsed = useAppSelector(
		(state) => state.global.isSidebarCollapsed,
	);
	const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
	const { me, isLoading: isMeLoading, error: hasMeError } = useMe();

	useEffect(() => {
		const status = (hasMeError as any)?.status;
		const isUnauthorized = status === 401 || (!isMeLoading && !me);

		if (isUnauthorized) router.replace('/login');
	}, [hasMeError, isMeLoading, me, router]);

	useEffect(() => {
		if (isDarkMode) {
			document.documentElement.classList.add('dark');
			document.documentElement.classList.remove('light');
		} else {
			document.documentElement.classList.add('light');
			document.documentElement.classList.remove('dark');
		}
	}, [isDarkMode]);

	if (isMeLoading) {
		return (
			<div className="py-4 w-full min-h-screen flex items-center justify-center">
				<CircularProgress />
			</div>
		);
	}

	if (!me) return null;

	return (
		<div
			className={`${
				isDarkMode ? 'dark' : 'light'
			} flex bg-gray-50 text-gray-900 w-full min-h-screen`}
		>
			<Sidebar />
			<main
				className={`flex flex-col w-full h-full py-7 px-9 bg-gray-50 ${
					isSidebarCollapsed ? 'md:pl-24' : 'md:pl-72'
				}`}
			>
				<Navbar />
				{children}
			</main>
		</div>
	);
};

const layout = ({ children }: Props) => {
	return <DashboardLayout>{children}</DashboardLayout>;
};

export default layout;
