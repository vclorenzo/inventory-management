'use client'

import { ReactNode, useMemo } from 'react'
import { I18nextProvider } from 'react-i18next'
import { createInstance, type Resource } from 'i18next'
import i18nConfig from '../../i18nConfig'

type TranslationsProviderProps = {
	children: ReactNode
	locale: string
	resources: Resource
}

export default function TranslationsProvider({
	children,
	locale,
	resources,
}: TranslationsProviderProps) {
	const i18n = useMemo(() => {
		const instance = createInstance()

		instance.init({
			lng: locale,
			resources,
			supportedLngs: i18nConfig.locales,
			fallbackLng: i18nConfig.defaultLocale,
			ns: ['default'],
			defaultNS: 'default',
			initAsync: false,
			interpolation: { escapeValue: false },
		})

		return instance
	}, [locale, resources])

	return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
}
