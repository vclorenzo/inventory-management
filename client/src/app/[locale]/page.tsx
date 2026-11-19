import { redirect } from 'next/navigation'
import { withLocale } from '@/utils/localePath'

type HomeProps = {
	params: { locale: string }
}

export default function Home({ params }: HomeProps) {
	redirect(withLocale(params.locale, '/dashboard'))
}
