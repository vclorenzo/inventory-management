import ReactHookForm from '@/components/forms/ReactHookForm'
import Header from '@/components/Header'
import { AUCTION_STATUS } from '@/constants/auctionStatus'
import { buildAuctionFormFields } from '@/constants/ProductForm'
import { ReusableFieldConfig } from '@/types/components/ReactHookForm'
import { AuctionFormValues } from '@/types/pages/Auctions'
import { defaultBiddingEndsAt, biddingEndsAtToIso } from '@/utils/auctionForm'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Plus, Trash2, XCircleIcon } from 'lucide-react'

type AuctionModalProps = {
	isOpen: boolean
	onClose: () => void
	onSend: (formData: AuctionFormValues) => void | Promise<void>
	isAuctionLoading: boolean
	defaultValues?: AuctionFormValues
}

const createMeetupLocation = () => ({
	name: '',
	address: '',
	mapLink: '',
})

const EMPTY_AUCTION_FORM: AuctionFormValues = {
	name: '',
	productCategory: '',
	brand: '',
	condition: '',
	price: 0,
	status: AUCTION_STATUS.Available,
	description: '',
	paymentMethods: [],
	meetupLocations: [createMeetupLocation()],
	shippingDetails: '',
	biddingEndsAt: defaultBiddingEndsAt(),
}

const AuctionModal = ({
	isOpen,
	onClose,
	onSend,
	isAuctionLoading,
	defaultValues,
}: AuctionModalProps) => {
	const [paymentMethodInput, setPaymentMethodInput] = useState('')
	const [submitError, setSubmitError] = useState<string | null>(null)

	const form = useForm<AuctionFormValues>()
	const {
		setValue,
		reset,
		watch,
		getValues,
		register,
		formState: { errors },
	} = form

	const paymentMethods = watch('paymentMethods') ?? []
	const meetupLocations = watch('meetupLocations') ?? []

	useEffect(() => {
		if (!isOpen) return
		reset(defaultValues ?? {
			...EMPTY_AUCTION_FORM,
			biddingEndsAt: defaultBiddingEndsAt(),
		})
		setPaymentMethodInput('')
		setSubmitError(null)
	}, [isOpen, defaultValues, reset])

	useEffect(() => {
		register('paymentMethods', {
			required: 'Add at least one payment method',
			validate: (value) =>
				Array.isArray(value) && value.length > 0
					? true
					: 'Add at least one payment method',
		})
		register('meetupLocations', {
			validate: (value) =>
				Array.isArray(value) &&
				value.some(
					(location) => location.name.trim() || location.address.trim(),
				)
					? true
					: 'Add at least one meetup location',
		})
	}, [register])

	const fields: ReusableFieldConfig<AuctionFormValues>[] = useMemo(
		() =>
			buildAuctionFormFields({
				getValues,
			}).filter(
				(field) =>
					!['paymentMethods', 'meetupLocations', 'shippingDetails'].includes(
						field.name,
					),
			),
		[getValues],
	)

	const addPaymentMethod = () => {
		const nextValue = paymentMethodInput.trim()
		if (!nextValue) return

		const alreadyExists = paymentMethods.some(
			(method) => method.toLowerCase() === nextValue.toLowerCase(),
		)
		if (alreadyExists) {
			setPaymentMethodInput('')
			return
		}

		setValue('paymentMethods', [...paymentMethods, nextValue], {
			shouldDirty: true,
			shouldValidate: true,
		})
		setPaymentMethodInput('')
	}

	const removePaymentMethod = (methodToRemove: string) => {
		setValue(
			'paymentMethods',
			paymentMethods.filter((method) => method !== methodToRemove),
			{
				shouldDirty: true,
				shouldValidate: true,
			},
		)
	}

	const updateMeetupLocation = (
		index: number,
		key: 'name' | 'address' | 'mapLink',
		value: string,
	) => {
		const nextLocations = meetupLocations.map((location, locationIndex) =>
			locationIndex === index ? { ...location, [key]: value } : location,
		)

		setValue('meetupLocations', nextLocations, {
			shouldDirty: true,
			shouldValidate: true,
		})
	}

	const addMeetupLocation = () => {
		setValue('meetupLocations', [...meetupLocations, createMeetupLocation()], {
			shouldDirty: true,
			shouldValidate: true,
		})
	}

	const removeMeetupLocation = (index: number) => {
		const nextLocations = meetupLocations.filter(
			(_, locationIndex) => locationIndex !== index,
		)

		setValue(
			'meetupLocations',
			nextLocations.length > 0 ? nextLocations : [createMeetupLocation()],
			{
				shouldDirty: true,
				shouldValidate: true,
			},
		)
	}

	const onSubmit = async (data: AuctionFormValues) => {
		setSubmitError(null)
		try {
			await Promise.resolve(
				onSend({
					...data,
					biddingEndsAt: biddingEndsAtToIso(data.biddingEndsAt),
				}),
			)
		} catch (error) {
			setSubmitError(
				error instanceof Error
					? error.message
					: 'Failed to save auction',
			)
		}
	}

	if (!isOpen) return null

	return (
		<div className="fixed inset-0 z-20 h-full w-full overflow-y-auto bg-gray-600 bg-opacity-50">
			<div className="relative top-20 mx-auto w-[fit-content] rounded-md border bg-white p-5 shadow-lg">
				<div className="flex flex-row items-center justify-between">
					<Header
						name={defaultValues ? 'Edit Auction' : 'Create New Auction'}
					/>
					<button onClick={onClose}>
						<XCircleIcon />
					</button>
				</div>
				<ReactHookForm
					form={form}
					fields={fields}
					onSubmit={onSubmit}
					submitLabel="Save"
					isSubmitting={isAuctionLoading}
					className="flex flex-col gap-4"
				>
					<div className="mt-2 space-y-5">
						<input type="hidden" {...register('paymentMethods')} />
						<input type="hidden" {...register('meetupLocations')} />

						<div className="space-y-2">
							<label className="min-w-[200px] font-bold">Payment Methods</label>
							<div className="rounded-lg border border-gray-200 p-3">
								<div className="flex gap-2">
									<input
										type="text"
										value={paymentMethodInput}
										onChange={(e) => setPaymentMethodInput(e.target.value)}
										onKeyDown={(e) => {
											if (e.key === 'Enter') {
												e.preventDefault()
												addPaymentMethod()
											}
										}}
										placeholder="Add a payment method like GCash or Cash"
										className="flex-1 rounded-lg border px-4 py-2 text-gray-700 focus:border-blue-500 focus:outline-none"
									/>
									<button
										type="button"
										onClick={addPaymentMethod}
										className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
									>
										<Plus className="h-4 w-4" />
										Add
									</button>
								</div>
								<div className="mt-3 flex flex-wrap gap-2">
									{paymentMethods.length > 0 ? (
										paymentMethods.map((method) => (
											<span
												key={method}
												className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-700"
											>
												{method}
												<button
													type="button"
													onClick={() => removePaymentMethod(method)}
													className="text-blue-700 hover:text-blue-900"
													aria-label={`Remove ${method}`}
												>
													<Trash2 className="h-4 w-4" />
												</button>
											</span>
										))
									) : (
										<div className="text-sm text-gray-500">
											No payment methods added yet.
										</div>
									)}
								</div>
								{errors.paymentMethods?.message ? (
									<div className="mt-2 text-sm text-red-600">
										{errors.paymentMethods.message}
									</div>
								) : null}
							</div>
						</div>

						<div className="space-y-3">
							<div className="flex items-center justify-between">
								<label className="min-w-[200px] font-bold">
									Meetup Locations
								</label>
								<button
									type="button"
									onClick={addMeetupLocation}
									className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
								>
									<Plus className="h-4 w-4" />
									Add location
								</button>
							</div>
							<div className="space-y-3">
								{meetupLocations.map((location, index) => (
									<div
										key={index}
										className="rounded-lg border border-gray-200 p-4"
									>
										<div className="mb-3 flex items-center justify-between">
											<div className="text-sm font-medium text-gray-700">
												Location {index + 1}
											</div>
											<button
												type="button"
												onClick={() => removeMeetupLocation(index)}
												className="text-gray-500 hover:text-red-600"
												aria-label={`Remove meetup location ${index + 1}`}
											>
												<Trash2 className="h-4 w-4" />
											</button>
										</div>
										<div className="grid gap-3">
											<input
												type="text"
												value={location.name}
												onChange={(e) =>
													updateMeetupLocation(index, 'name', e.target.value)
												}
												placeholder="Location name"
												className="rounded-lg border px-4 py-2 text-gray-700 focus:border-blue-500 focus:outline-none"
											/>
											<input
												type="text"
												value={location.address}
												onChange={(e) =>
													updateMeetupLocation(index, 'address', e.target.value)
												}
												placeholder="Full address"
												className="rounded-lg border px-4 py-2 text-gray-700 focus:border-blue-500 focus:outline-none"
											/>
											<input
												type="url"
												value={location.mapLink}
												onChange={(e) =>
													updateMeetupLocation(index, 'mapLink', e.target.value)
												}
												placeholder="Map link (optional)"
												className="rounded-lg border px-4 py-2 text-gray-700 focus:border-blue-500 focus:outline-none"
											/>
										</div>
									</div>
								))}
							</div>
							{errors.meetupLocations?.message ? (
								<div className="text-sm text-red-600">
									{errors.meetupLocations.message}
								</div>
							) : null}
						</div>

						<div className="space-y-2">
							<label
								htmlFor="product-shipping-details"
								className="min-w-[200px] font-bold"
							>
								Shipping Details
							</label>
							<textarea
								id="product-shipping-details"
								rows={4}
								placeholder="Couriers, rates, areas you ship to, handling time, etc."
								className="min-h-[100px] w-full rounded-lg border px-4 py-2 text-gray-700 focus:border-blue-500 focus:outline-none"
								{...register('shippingDetails', {
									required: 'Shipping details are required',
									validate: (value) =>
										typeof value === 'string' && value.trim()
											? true
											: 'Shipping details are required',
								})}
							/>
							{errors.shippingDetails?.message ? (
								<div className="text-sm text-red-600">
									{errors.shippingDetails.message}
								</div>
							) : null}
						</div>

						{submitError ? (
							<div
								role="alert"
								className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
							>
								{submitError}
							</div>
						) : null}
					</div>
				</ReactHookForm>
			</div>
		</div>
	)
}

export default AuctionModal
