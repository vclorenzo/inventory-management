'use client'

import { useLocalePath } from '@/hooks/useLocalePath'
import { withLocale } from '@/utils/localePath'
import i18nConfig from '../../i18nConfig'

const languageLabels: Record<string, string> = {
	en: 'English',
	es: 'Spanish',
	ja: 'Japanese',
}

export default function LanguageSwitcher({
	isLocale = true,
}: {
	isLocale: boolean
}) {
	const { locale, pathname } = useLocalePath()

	function changeLanguage(newLocale: string) {
		if (newLocale === locale) return

		const cookieName = i18nConfig.localeCookie ?? 'NEXT_LOCALE'
		document.cookie = `${cookieName}=${newLocale};path=/;max-age=31536000;SameSite=Lax`

		if (i18nConfig.noPrefix) {
			window.location.reload()
			return
		}

		window.location.assign(
			withLocale(newLocale, pathname) +
				window.location.search +
				window.location.hash,
		)
	}

	return (
		<select
			aria-label="Language"
			value={locale}
			onChange={(event) => changeLanguage(event.target.value)}
		>
			{i18nConfig.locales.map((language) => (
				<option key={language} value={language}>
					{isLocale
						? language.toUpperCase()
						: (languageLabels[language] ?? language)}
				</option>
			))}
		</select>
	)
}
