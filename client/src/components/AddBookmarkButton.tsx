'use client'

import { useAddBookmarkMutation } from '@/state/internal/bookmarksApi'
import { BookmarkListingType } from '@/types/pages/Bookmarks'
import { getMutationErrorMessage } from '@/utils/mutation'
import { Bookmark } from 'lucide-react'
import { useId, useState } from 'react'

type AddBookmarkButtonProps = {
	itemId: string
	listingType: BookmarkListingType
}

function AddBookmarkButton({ itemId, listingType }: AddBookmarkButtonProps) {
	const [addBookmark, { isLoading }] = useAddBookmarkMutation()
	const [errorMessage, setErrorMessage] = useState<string | null>(null)
	const errorId = useId()

	const handleAddBookmark = async () => {
		setErrorMessage(null)

		try {
			await addBookmark({ itemId, listingType }).unwrap()
		} catch (error) {
			setErrorMessage(
				getMutationErrorMessage(error, 'Could not add to bookmarks'),
			)
		}
	}

	return (
		<div className="flex flex-col">
			<button
				type="button"
				aria-label="Add to bookmarks"
				title="Add to bookmarks"
				aria-busy={isLoading}
				aria-describedby={errorMessage ? errorId : undefined}
				onClick={handleAddBookmark}
				disabled={isLoading}
				className="inline-flex flex-1 justify-center rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
			>
				<Bookmark />
			</button>
			{errorMessage && (
				<p
					id={errorId}
					role="alert"
					className="mt-2 text-center text-sm text-red-600"
				>
					{errorMessage}
				</p>
			)}
		</div>
	)
}

export default AddBookmarkButton
