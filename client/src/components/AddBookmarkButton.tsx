'use client'

import { useMe } from '@/hooks/useMe'
import { useToast } from '@/components/ToastProvider'
import {
	useAddBookmarkMutation,
	useGetBookmarksQuery,
	useRemoveBookmarkMutation,
} from '@/state/internal/bookmarksApi'
import { BookmarkListingType } from '@/types/pages/Bookmarks'
import { getMutationErrorMessage } from '@/utils/mutation'
import { Bookmark } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useId, useState } from 'react'

type AddBookmarkButtonProps = {
	itemId: string
	listingType: BookmarkListingType
	variant?: 'solid' | 'ghost'
}

function isUnauthorizedError(error: unknown) {
	return (
		error &&
		typeof error === 'object' &&
		'status' in error &&
		error.status === 401
	)
}

function AddBookmarkButton({
	itemId,
	listingType,
	variant = 'solid',
}: AddBookmarkButtonProps) {
	const router = useRouter()
	const { me } = useMe()
	const { showToast } = useToast()
	const {
		data,
		error: bookmarksError,
		isLoading: isBookmarksLoading,
		isError: isBookmarksError,
		isSuccess: isBookmarksSuccess,
	} = useGetBookmarksQuery(undefined, { skip: !me })
	const [addBookmark, { isLoading: isAdding }] = useAddBookmarkMutation()
	const [removeBookmark, { isLoading: isRemoving }] =
		useRemoveBookmarkMutation()
	const [errorMessage, setErrorMessage] = useState<string | null>(null)
	const errorId = useId()

	const existingBookmark =
		listingType === 'Marketplace'
			? data?.marketplace?.find(
					(bookmark) => bookmark.item.productId === itemId,
				)
			: data?.auctions?.find(
					(bookmark) => bookmark.item.productId === itemId,
				)
	const isBookmarked = isBookmarksSuccess && Boolean(existingBookmark)
	const isLoading = isAdding || isRemoving || isBookmarksLoading
	const canToggleBookmark = !me || isBookmarksSuccess
	const queryErrorMessage = isBookmarksError
		? getMutationErrorMessage(
				bookmarksError,
				'Could not load bookmark status',
			)
		: null
	const visibleErrorMessage = errorMessage ?? queryErrorMessage
	const label = isBookmarksError
		? 'Bookmark status unavailable'
		: isBookmarksLoading
			? 'Loading bookmark status'
			: isBookmarked
				? 'Remove bookmark'
				: 'Add to bookmarks'

	const handleToggleBookmark = async () => {
		if (!me) {
			router.push('/login')
			return
		}

		if (!canToggleBookmark || isLoading) {
			return
		}

		setErrorMessage(null)

		try {
			if (existingBookmark) {
				await removeBookmark(existingBookmark.bookmarkId).unwrap()
				showToast('Removed from bookmarks')
				return
			}

			await addBookmark({ itemId, listingType }).unwrap()
			showToast('You bookmarked this item')
		} catch (error) {
			if (isUnauthorizedError(error)) {
				router.push('/login')
				return
			}

			setErrorMessage(
				getMutationErrorMessage(
					error,
					isBookmarked
						? 'Could not remove bookmark'
						: 'Could not add to bookmarks',
				),
			)
		}
	}

	const buttonClassName =
		variant === 'ghost'
			? 'inline-flex shrink-0 items-center justify-center rounded-lg p-1.5 text-gray-900 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60'
			: 'inline-flex flex-1 items-center justify-center rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60'

	return (
		<div className="flex flex-col">
			<button
				type="button"
				aria-label={label}
				title={label}
				aria-pressed={isBookmarksSuccess ? isBookmarked : undefined}
				aria-busy={isLoading}
				aria-describedby={
					visibleErrorMessage ? errorId : undefined
				}
				onClick={() => {
					void handleToggleBookmark()
				}}
				disabled={isLoading || !canToggleBookmark}
				className={buttonClassName}
			>
				<Bookmark
					aria-hidden
					className={isBookmarked ? 'fill-current' : undefined}
				/>
			</button>
			{visibleErrorMessage && (
				<p
					id={errorId}
					role="alert"
					className="mt-2 text-center text-sm text-red-600"
				>
					{visibleErrorMessage}
				</p>
			)}
		</div>
	)
}

export default AddBookmarkButton
