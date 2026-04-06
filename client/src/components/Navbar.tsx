'use client';
import { useAppDispatch, useAppSelector } from '@/state/redux';
import { setIsDarkMode, setIsSidebarCollapsed } from '@/state';

import {
	Bell,
	Menu,
	Moon,
	ShoppingCart,
	Gavel,
	Sun,
	Bookmark,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react';
import Button from './Button';
import { toggleDarkMode, useIsDarkModeVisible, useIsNotificationVisible } from '@/utils/global';

type Props = {};

const Navbar = (props: Props) => {
	const [isOpen, setIsOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(e.target as Node)
			)
				setIsOpen(false);
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	const dispatch = useAppDispatch();
	const isSidebarCollapsed = useAppSelector(
		(state) => state.global.isSidebarCollapsed,
	);

	// const sidebarClassNames = `fixed flex flex-col ${
	// 	isSidebarCollapsed ? 'w-0 md:w-16' : 'w-72 md:w-64'
	// } bg-white transition-all duration-300 overflow-hidden h-full shadow-md z-40`;

	const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

	const toggleSidebar = () => {
		dispatch(setIsSidebarCollapsed(!isSidebarCollapsed));
	};

	const isDarkModeVisible = useIsDarkModeVisible();
	const isNotificationVisible = useIsNotificationVisible();

	const toggleDropdown = () => {
		setIsOpen((prev) => !prev);
	};

	return (
		<>
			<div className="flex justify-between items-center w-full mb-7">
				<div className="flex justify-between items-center gap-5">
					<button
						className="px-3 py-3 bg-gray-100 rounded-full hover:bg-blue-100"
						onClick={toggleSidebar}
					>
						<Menu className="w-4 h-4" />
					</button>

					<Link href={'/marketplace'}>
						<Button
							text="Marketplace"
							variant="outlined"
							onClick={() => {
								console.log('Hello');
							}}
						/>
					</Link>

					{/* <div className="relative">
						<input
							type="search"
							placeholder="Start type to search groups & products"
							className="pl-10 pr-4 py-2 w-50 md:w-60 border-2 border-gray-300 bg-white rounded-lg focus:outline-none focus:border-blue-500"
						/>
						<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-non">
							<Bell className="text-gray-500" size={20} />
						</div>
					</div> */}
				</div>
				<div className="flex justify-between items-center gap-5">
					<div className="hidden md:flex justify-center items-center gap-5">
						{isDarkModeVisible && (
							<div>
								<button onClick={() => toggleDarkMode(dispatch, isDarkMode)}>
									{isDarkMode ? (
										<Sun className="cursor-pointer text-gray-500" size={24} />
									) : (
										<Moon className="cursor-pointer text-gray-500" size={24} />
									)}
								</button>
							</div>
						)}
						{isNotificationVisible && (
							<div className="relative">
								<Link href={'/notifications'}>
									<Bell className="cursor-pointer text-gray-500" size={24} />
									<span className="absolute -top-2 -right-2 inline-flex items-center justify-center px-[0.4rem] py-1 text-xs font-semibold leading-none text-red-100 bg-red-400 rounded-full">
										3
									</span>
								</Link>
							</div>
						)}
						<div>
							<Link href={'/bookmarks'}>
								<Bookmark className="cursor-pointer text-gray-500" size={24} />
							</Link>
						</div>
						<hr className="w-0 h-7 border border-solid border-l border-gray-300 mx-3" />
						<div className="relative" ref={dropdownRef}>
							<div
								className="flex items-center gap-3 cursor-pointer"
								onClick={toggleDropdown}
							>
								<div className="w-9 h-9">
									<Image
										src={
											'https://s3-inventory-management-img-bucket.s3.ap-southeast-2.amazonaws.com/profile.jpg'
										}
										alt="Profile"
										width={50}
										height={50}
										className="rounded-full h-full object-cover"
									/>
								</div>
								<div className="font-semibold">Vanz</div>
							</div>
							{isOpen && (
								<div
									className="
      absolute -right-1 mt-6 w-48 rounded-xl bg-white shadow-lg
      border border-gray-100 overflow-hidden
      animate-dropdown z-50
    "
								>
									<Link
										href="/account/profile"
										className="block px-4 py-2 text-sm hover:bg-gray-100"
									>
										<button
											className="w-full text-left text-sm text-red-500 hover:bg-gray-100"
											onClick={toggleDropdown}
										>
											Profile
										</button>
									</Link>
									<Link
										href="/account/settings"
										className="block px-4 py-2 text-sm hover:bg-gray-100"
									>
										<button
											className="w-full text-left text-sm text-red-500 hover:bg-gray-100"
											onClick={toggleDropdown}
										>
											Settings
										</button>
									</Link>

									<button
										className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100"
										onClick={toggleDropdown}
									>
										Logout
									</button>
								</div>
							)}
						</div>
					</div>
					<Link href={'/bids'}>
						<Gavel className="cursor-pointer text-gray-500" size={24} />
					</Link>
					<Link href={'/cart'}>
						<ShoppingCart className="cursor-pointer text-gray-500" size={24} />
					</Link>
				</div>
			</div>
		</>
	);
};

export default Navbar;
