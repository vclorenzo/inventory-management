'use client'

import AddressManager from '@/components/AddressManager'
import type { Address } from '@/types/pages/Profile'
import { X } from 'lucide-react'

type ManageAddressesModalProps = {
	isOpen: boolean
	onClose: () => void
	userId: string
	addresses: Address[]
	defaultRecipient?: {
		name?: string
		contactNumber?: string | null
	}
}

const ManageAddressesModal = ({
	isOpen,
	onClose,
	userId,
	addresses,
	defaultRecipient,
}: ManageAddressesModalProps) => {
	if (!isOpen) return null

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
			onClick={onClose}
			role="presentation"
		>
			<div
				className="max-h-[90vh] w-full max-w-2xl overflow-y-auto"
				onClick={(e) => e.stopPropagation()}
				role="dialog"
				aria-modal="true"
				aria-labelledby="manage-addresses-title"
			>
				<div className="mb-3 flex items-center justify-end">
					<button
						type="button"
						onClick={onClose}
						className="rounded bg-white/90 p-1.5 text-gray-500 shadow-sm hover:bg-white hover:text-gray-700"
						aria-label="Close"
					>
						<X className="h-5 w-5" />
					</button>
				</div>

				<span id="manage-addresses-title" className="sr-only">
					Manage addresses
				</span>

				<AddressManager
					userId={userId}
					addresses={addresses}
					defaultRecipient={defaultRecipient}
				/>
			</div>
		</div>
	)
}

export default ManageAddressesModal
