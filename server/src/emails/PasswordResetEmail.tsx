import { Heading, Link, Text } from 'react-email';
import {
	Layout,
	buttonStyle,
	headingStyle,
	paragraphStyle,
} from './components/Layout.tsx';

export type PasswordResetEmailProps = {
	name: string;
	resetUrl: string;
	expiresInMinutes: number;
};

export default function PasswordResetEmail({
	name,
	resetUrl,
	expiresInMinutes,
}: PasswordResetEmailProps) {
	return (
		<Layout preview="Reset your password">
			<Heading as="h1" style={headingStyle}>
				Reset your password
			</Heading>
			<Text style={paragraphStyle}>Hi {name},</Text>
			<Text style={paragraphStyle}>
				We received a request to reset your password. Click the button below to
				choose a new one. This link expires in {expiresInMinutes} minutes.
			</Text>
			<Link href={resetUrl} style={buttonStyle}>
				Reset password
			</Link>
			<Text style={{ ...paragraphStyle, marginTop: '24px' }}>
				If you did not request a password reset, no action is needed.
			</Text>
		</Layout>
	);
}
