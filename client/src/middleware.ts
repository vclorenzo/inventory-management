import { NextRequest } from 'next/server'
import { i18nRouter } from 'next-i18n-router'
import i18nConfig from '../i18nConfig'

export function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl
	const pathLocale = i18nConfig.locales.find(
		(locale) =>
			pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
	)

	if (pathLocale) {
		request.headers.set('x-next-i18n-router-locale', pathLocale)
	}

	return i18nRouter(request, i18nConfig)
}

export const config = {
	matcher: ['/((?!api|static|.*\\..*|_next).*)'],
}
