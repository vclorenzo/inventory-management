import {
	Body,
	Container,
	Head,
	Hr,
	Html,
	Preview,
	Section,
	Text,
} from 'react-email';
import type { ReactNode } from 'react';

export const APP_NAME = 'Inventory Management';

type LayoutProps = {
	preview: string;
	children: ReactNode;
};

export const buttonStyle = {
	backgroundColor: '#2563eb',
	borderRadius: '6px',
	color: '#ffffff',
	display: 'inline-block',
	fontSize: '15px',
	fontWeight: 600,
	padding: '12px 24px',
	textDecoration: 'none',
} as const;

export const headingStyle = {
	color: '#111827',
	fontSize: '22px',
	fontWeight: 700,
	margin: '0 0 16px',
} as const;

export const paragraphStyle = {
	color: '#374151',
	fontSize: '15px',
	lineHeight: '24px',
	margin: '0 0 16px',
} as const;

export function Layout({ preview, children }: LayoutProps) {
	return (
		<Html lang="en">
			<Head />
			<Preview>{preview}</Preview>
			<Body
				style={{
					backgroundColor: '#f3f4f6',
					fontFamily:
						'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
					margin: 0,
					padding: '24px 0',
				}}
			>
				<Container
					style={{
						backgroundColor: '#ffffff',
						borderRadius: '8px',
						margin: '0 auto',
						maxWidth: '560px',
						padding: '32px',
					}}
				>
					<Section>{children}</Section>
					<Hr style={{ borderColor: '#e5e7eb', margin: '24px 0' }} />
					<Text style={{ color: '#9ca3af', fontSize: '12px', margin: 0 }}>
						{APP_NAME}. If you did not expect this email, you can safely ignore
						it.
					</Text>
				</Container>
			</Body>
		</Html>
	);
}
