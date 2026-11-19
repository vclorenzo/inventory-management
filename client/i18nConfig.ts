import { Config } from 'next-i18n-router/dist/types'
// import { extract } from 'i18next-extract'

const i18nConfig: Config = {
	locales: ['en', 'es', 'ja'],
	defaultLocale: 'en',
	prefixDefault: true,
	// extract: {
	// 	input: ['src/**/*.{js,jsx,ts,tsx}'],
	// 	output: 'public/locales/{{language}}/{{namespace}}.json',
	// },
}

export default i18nConfig
