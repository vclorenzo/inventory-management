'use client';
import { ToastProvider } from '@/components/ToastProvider';
import StoreProvider from '@/state/redux';
import React from 'react';

type Props = {
	children: React.ReactNode;
};

const ProviderWrapper = ({ children }: Props) => {
	return (
		<StoreProvider>
			<ToastProvider>{children}</ToastProvider>
		</StoreProvider>
	);
};

export default ProviderWrapper;
