'use client';
import StoreProvider from '@/state/redux';
import React from 'react';

type Props = {
	children: React.ReactNode;
};

const ProviderWrapper = ({ children }: Props) => {
	return <StoreProvider>{children}</StoreProvider>;
};

export default ProviderWrapper;
