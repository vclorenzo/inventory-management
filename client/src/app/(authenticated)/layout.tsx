'use client';

import React, { useEffect } from 'react';
import { useAppSelector } from '@/state/redux';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';

type Props = {
	children: React.ReactNode;
};

const DashboardLayout = ({ children }: Props) => {
	const isSidebarCollapsed = useAppSelector(
		(state) => state.global.isSidebarCollapsed,
	);
	const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

	useEffect(() => {
		if (isDarkMode) {
			document.documentElement.classList.add('dark');
			document.documentElement.classList.remove('light');
		} else {
			document.documentElement.classList.add('light');
			document.documentElement.classList.remove('dark');
		}
	}, [isDarkMode]);

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
