'use client'

import {
	useBulkCreateProductsMutation,
	useLazyDownloadProductTemplateQuery,
} from '@/state/internal/productsApi'
import { ProductCsvRowError } from '@/types/pages/Products'
import { Download, FileUp, X } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'

const CSV_MAX_BYTES = 2 * 1024 * 1024

type BulkUploadModalProps = {
	isOpen: boolean
	onClose: () => void
}

function readBulkError(error: unknown): {
	message: string
	rows: ProductCsvRowError[]
} {
	const fallback = 'Failed to upload products'
	if (!error || typeof error !== 'object' || !('data' in error)) {
		return {
			message:
				error instanceof Error && error.message ? error.message : fallback,
			rows: [],
		}
	}

	const data = error.data
	if (!data || typeof data !== 'object') {
		return { message: fallback, rows: [] }
	}

	const message =
		'message' in data && typeof data.message === 'string' && data.message
			? data.message
			: fallback
	const rows =
		'errors' in data && Array.isArray(data.errors)
			? data.errors.flatMap((item) => {
					if (
						item &&
						typeof item === 'object' &&
						'row' in item &&
						'message' in item &&
						typeof item.row === 'number' &&
						typeof item.message === 'string'
					) {
						return [{ row: item.row, message: item.message }]
					}
					return []
				})
			: []

	return { message, rows }
}

function BulkUploadModal({ isOpen, onClose }: BulkUploadModalProps) {
	const titleId = useId()
	const fileInputId = useId()
	const fileInputRef = useRef<HTMLInputElement>(null)
	const [file, setFile] = useState<File | null>(null)
	const [errorMessage, setErrorMessage] = useState<string | null>(null)
	const [rowErrors, setRowErrors] = useState<ProductCsvRowError[]>([])
	const [createdCount, setCreatedCount] = useState<number | null>(null)
	const [bulkCreateProducts, { isLoading: isUploading }] =
		useBulkCreateProductsMutation()
	const [fetchTemplate, { isFetching: isDownloadingTemplate }] =
		useLazyDownloadProductTemplateQuery()

	useEffect(() => {
		if (!isOpen) return
		setFile(null)
		setErrorMessage(null)
		setRowErrors([])
		setCreatedCount(null)
		if (fileInputRef.current) fileInputRef.current.value = ''
	}, [isOpen])

	useEffect(() => {
		if (!isOpen) return

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape' && !isUploading) {
				onClose()
			}
		}

		window.addEventListener('keydown', handleKeyDown)
		return () => window.removeEventListener('keydown', handleKeyDown)
	}, [isOpen, isUploading, onClose])

	if (!isOpen) return null

	const clearFileInput = () => {
		if (fileInputRef.current) fileInputRef.current.value = ''
	}

	const handleFileChange = (nextFile: File | null) => {
		setCreatedCount(null)
		setErrorMessage(null)
		setRowErrors([])

		if (!nextFile) {
			setFile(null)
			return
		}

		const isCsv =
			nextFile.name.toLowerCase().endsWith('.csv') ||
			nextFile.type === 'text/csv' ||
			nextFile.type === 'application/vnd.ms-excel'
		if (!isCsv) {
			setFile(null)
			clearFileInput()
			setErrorMessage('Choose a .csv file.')
			return
		}

		if (nextFile.size > CSV_MAX_BYTES) {
			setFile(null)
			clearFileInput()
			setErrorMessage('CSV file must be 2 MB or smaller.')
			return
		}

		setFile(nextFile)
	}

	const handleDownloadTemplate = async () => {
		if (isDownloadingTemplate) return
		setErrorMessage(null)
		setRowErrors([])
		try {
			const csv = await fetchTemplate().unwrap()
			const url = URL.createObjectURL(
				new Blob([csv], { type: 'text/csv;charset=utf-8' }),
			)
			const link = document.createElement('a')
			link.href = url
			link.download = 'product-upload-template.csv'
			document.body.appendChild(link)
			link.click()
			link.remove()
			URL.revokeObjectURL(url)
		} catch {
			setErrorMessage('Failed to download the template.')
		}
	}

	const handleUpload = async () => {
		if (!file || isUploading) return
		setErrorMessage(null)
		setRowErrors([])
		setCreatedCount(null)
		try {
			const result = await bulkCreateProducts(file).unwrap()
			setCreatedCount(result.createdCount)
			setRowErrors(result.errors)
			setFile(null)
			clearFileInput()
		} catch (error) {
			const parsed = readBulkError(error)
			setErrorMessage(parsed.message)
			setRowErrors(parsed.rows)
		}
	}

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
			onClick={() => {
				if (!isUploading) onClose()
			}}
		>
			<div
				role="dialog"
				aria-modal="true"
				aria-labelledby={titleId}
				className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-lg"
				onClick={(event) => event.stopPropagation()}
			>
				<header className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
					<h2 id={titleId} className="text-lg font-semibold text-gray-900">
						Bulk upload
					</h2>
					<button
						type="button"
						onClick={onClose}
						disabled={isUploading}
						className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-800 disabled:opacity-60"
						aria-label="Close"
					>
						<X className="h-5 w-5" />
					</button>
				</header>

				<div className="space-y-4 px-5 py-5">
					<p className="text-sm text-gray-600">
						Upload a CSV to create many products at once. Keep the header row
						from the template.
					</p>

					<button
						type="button"
						onClick={handleDownloadTemplate}
						disabled={isDownloadingTemplate || isUploading}
						className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
					>
						<Download className="h-4 w-4" />
						{isDownloadingTemplate
							? 'Downloading...'
							: 'Download CSV template'}
					</button>

					<label
						htmlFor={fileInputId}
						className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-center hover:border-blue-400 hover:bg-blue-50"
					>
						<FileUp className="h-6 w-6 text-gray-500" />
						<span className="mt-2 text-sm font-medium text-gray-800">
							{file ? file.name : 'Choose a CSV file'}
						</span>
						<span className="mt-1 text-xs text-gray-500">
							.csv up to 2 MB, 200 products
						</span>
						<input
							ref={fileInputRef}
							id={fileInputId}
							type="file"
							accept=".csv,text/csv"
							className="sr-only"
							disabled={isUploading}
							onChange={(event) =>
								handleFileChange(event.target.files?.[0] ?? null)
							}
						/>
					</label>

					<ul className="space-y-1 text-xs text-gray-500">
						<li>
							Payment methods are separated with semicolons, for example
							GCash;Cash.
						</li>
						<li>
							Meetup locations use Name|Address|Map link. Separate extra
							locations with semicolons.
						</li>
						<li>
							Status can be Available, Reserved, or Unlisted. Leave it blank to
							list the product. Reserved stays only when stock is 1. A stock of
							0 is saved as Sold Out.
						</li>
						<li>
							Invalid rows, duplicate rows, and products you already listed
							are skipped. The other rows are still imported.
						</li>
					</ul>

					<button
						type="button"
						onClick={handleUpload}
						disabled={!file || isUploading}
						className="flex w-full items-center justify-center rounded bg-blue-500 px-4 py-2 font-bold text-gray-200 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
					>
						{isUploading ? 'Uploading...' : 'Upload products'}
					</button>

					{createdCount !== null ? (
						<p
							role="status"
							className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800"
						>
							Created {createdCount}{' '}
							{createdCount === 1 ? 'product' : 'products'}.
						</p>
					) : null}

					{createdCount !== null && rowErrors.length > 0 ? (
						<div
							role="status"
							className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800"
						>
							<p>
								Skipped {rowErrors.length}{' '}
								{rowErrors.length === 1 ? 'row' : 'rows'}.
							</p>
							<ul className="mt-2 max-h-40 space-y-1 overflow-y-auto">
								{rowErrors.map((rowError) => (
									<li key={`${rowError.row}-${rowError.message}`}>
										Row {rowError.row}: {rowError.message}
									</li>
								))}
							</ul>
						</div>
					) : null}

					{errorMessage ? (
						<div
							role="alert"
							className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
						>
							<p>{errorMessage}</p>
							{rowErrors.length > 0 ? (
								<ul className="mt-2 max-h-40 space-y-1 overflow-y-auto">
									{rowErrors.map((rowError) => (
										<li key={`${rowError.row}-${rowError.message}`}>
											Row {rowError.row}: {rowError.message}
										</li>
									))}
								</ul>
							) : null}
						</div>
					) : null}
				</div>
			</div>
		</div>
	)
}

export default BulkUploadModal
