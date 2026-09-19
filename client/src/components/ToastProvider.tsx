'use client'

import { Alert, Snackbar } from '@mui/material'
import {
	createContext,
	useCallback,
	useContext,
	useMemo,
	useState,
} from 'react'

type ToastSeverity = 'success' | 'error'

type ToastState = {
	open: boolean
	message: string
	severity: ToastSeverity
}

type ToastContextValue = {
	showToast: (message: string, severity?: ToastSeverity) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
	const [toast, setToast] = useState<ToastState>({
		open: false,
		message: '',
		severity: 'success',
	})

	const showToast = useCallback(
		(message: string, severity: ToastSeverity = 'success') => {
			setToast({ open: true, message, severity })
		},
		[],
	)

	const handleClose = useCallback(() => {
		setToast((current) => ({ ...current, open: false }))
	}, [])

	const value = useMemo(() => ({ showToast }), [showToast])

	return (
		<ToastContext.Provider value={value}>
			{children}
			<Snackbar
				open={toast.open}
				autoHideDuration={3000}
				onClose={handleClose}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
			>
				<Alert
					severity={toast.severity}
					variant="filled"
					onClose={handleClose}
				>
					{toast.message}
				</Alert>
			</Snackbar>
		</ToastContext.Provider>
	)
}

export function useToast() {
	const context = useContext(ToastContext)

	if (!context) {
		throw new Error('useToast must be used within ToastProvider')
	}

	return context
}
