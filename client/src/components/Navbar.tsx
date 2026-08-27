'use client'
import { setIsSidebarCollapsed } from '@/state'
import { api } from '@/state/api'
import { externalApi } from '@/state/externalApi'
import { useSignOutMutation } from '@/state/internal/authApi'
import { useAppDispatch, useAppSelector } from '@/state/redux'
import { toggleDarkMode } from '@/utils/global'
import {
	Bell,
	Bookmark,
	Gavel,
	Menu,
	Moon,
	ShoppingCart,
	Sun,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'

//hooks
import { useMe } from '@/hooks/useMe'

const Navbar = () => {
	const [isOpen, setIsOpen] = useState(false)
	const dropdownRef = useRef<HTMLDivElement | null>(null)
	const router = useRouter()

	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(e.target as Node)
			)
				setIsOpen(false)
		}

		document.addEventListener('mousedown', handleClickOutside)
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [])

	const dispatch = useAppDispatch()
	const isSidebarCollapsed = useAppSelector(
		(state) => state.global.isSidebarCollapsed,
	)
	const isDarkMode = useAppSelector((state) => state.global.isDarkMode)

	const toggleSidebar = useCallback(() => {
		dispatch(setIsSidebarCollapsed(!isSidebarCollapsed))
	}, [dispatch, isSidebarCollapsed])

	const { me } = useMe()
	const { name, email } = me?.data ?? { name: '', email: '' }
	const [signOut] = useSignOutMutation()

	const toggleDropdown = useCallback(() => {
		setIsOpen((prev) => !prev)
	}, [])

	const initials = (name || email || '?').trim().charAt(0).toUpperCase()

	return (
		<>
			<div className="mb-7 flex w-full items-center justify-between">
				<div className="flex items-center justify-between gap-5">
					{me && (
						<>
							{' '}
							<button
								type="button"
								className="rounded-full bg-gray-100 px-3 py-3 hover:bg-blue-100"
								onClick={toggleSidebar}
							>
								<Menu className="h-4 w-4" />
							</button>
							<Link
								href="/marketplace"
								className="px-4 py-2 font-bold text-blue-500 hover:text-blue-700"
							>
								Marketplace
							</Link>
							<Link
								href="/auctions"
								className="px-4 py-2 font-bold text-blue-500 hover:text-blue-700"
							>
								Auctions
							</Link>
						</>
					)}
				</div>
				<div className="flex items-center justify-between gap-5">
					<div className="hidden items-center justify-center gap-5 md:flex">
						<div>
							<button
								type="button"
								onClick={() => toggleDarkMode(dispatch, isDarkMode)}
							>
								{isDarkMode ? (
									<Sun className="cursor-pointer text-gray-500" size={24} />
								) : (
									<Moon className="cursor-pointer text-gray-500" size={24} />
								)}
							</button>
						</div>

						<div className="relative">
							<Link href={'/notifications'}>
								<Bell className="cursor-pointer text-gray-500" size={24} />
								<span className="absolute -right-2 -top-2 inline-flex items-center justify-center rounded-full bg-red-400 px-[0.4rem] py-1 text-xs font-semibold leading-none text-red-100">
									3
								</span>
							</Link>
						</div>

						{me ? (
							<div>
								<Link href={'/bookmarks'}>
									<Bookmark
										className="cursor-pointer text-gray-500"
										size={24}
									/>
								</Link>
							</div>
						) : undefined}
						<hr className="mx-3 h-7 w-0 border border-l border-solid border-gray-300" />
						<div className="relative" ref={dropdownRef}>
							<div
								className={`flex items-center gap-3 ${me ? 'cursor-pointer' : ''}`}
								onClick={me ? toggleDropdown : undefined}
								role={me ? 'button' : undefined}
								tabIndex={me ? 0 : -1}
								aria-haspopup={me ? 'menu' : undefined}
								aria-expanded={me ? isOpen : undefined}
								onKeyDown={
									me
										? (e) => {
												if (e.key === 'Enter' || e.key === ' ') {
													e.preventDefault()
													toggleDropdown()
												}
											}
										: undefined
								}
							>
								{me ? (
									<>
										<div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 font-semibold text-white">
											{initials}
										</div>
										<div className="font-semibold">{me.data.name}</div>
									</>
								) : (
									<Link
										href="/login"
										className="rounded-lg border border-blue-500 px-4 py-2 text-blue-600 hover:bg-blue-50"
									>
										Login
									</Link>
								)}
							</div>
							{isOpen && me && (
								<div className="animate-dropdown absolute -right-1 z-50 mt-6 w-48 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg">
									<Link
										href="/account"
										className="block px-4 py-2 text-sm hover:bg-gray-100"
										onClick={() => setIsOpen(false)}
									>
										Account
									</Link>
									<Link
										href="/account/settings"
										className="block px-4 py-2 text-sm hover:bg-gray-100"
										onClick={() => setIsOpen(false)}
									>
										Settings
									</Link>

									<button
										type="button"
										className="w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-gray-100"
										onClick={async () => {
											setIsOpen(false)

											await signOut().unwrap()
											dispatch(api.util.resetApiState())
											dispatch(externalApi.util.resetApiState())
											router.push('/login')
										}}
									>
										Logout
									</button>
								</div>
							)}
						</div>
					</div>
					{me ? (
						<>
							<Link href={'/bids'}>
								<Gavel className="cursor-pointer text-gray-500" size={24} />
							</Link>
							<Link href={'/cart'}>
								<ShoppingCart
									className="cursor-pointer text-gray-500"
									size={24}
								/>
							</Link>
						</>
					) : undefined}
				</div>
			</div>
		</>
	)
}

export default Navbar
