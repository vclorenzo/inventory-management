import { Heading, Link, Text } from 'react-email';
import {
	APP_NAME,
	Layout,
	buttonStyle,
	headingStyle,
	paragraphStyle,
} from './components/Layout.tsx';

export type WelcomeEmailProps = {
	name: string;
	loginUrl: string;
};

export default function WelcomeEmail({ name, loginUrl }: WelcomeEmailProps) {
	return (
		<Layout preview={`Welcome to ${APP_NAME}`}>
			<Heading as="h1" style={headingStyle}>
				Welcome, {name}!
			</Heading>
			<Text style={paragraphStyle}>
				Your account has been created. You can now sign in and start using{' '}
				{APP_NAME}.
			</Text>
			<Link href={loginUrl} style={buttonStyle}>
				Sign in
			</Link>
		</Layout>
	);
}
