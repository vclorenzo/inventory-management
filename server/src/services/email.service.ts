import type { ReactElement } from 'react';
import type { Attachment } from 'nodemailer/lib/mailer/index.js';
import { render } from 'react-email';
import { getMailConfig } from '#config/env.ts';
import { getTransporter } from '#config/mailer.ts';
import logger from '#config/logger.ts';
import { AppError } from '#error/AppError.ts';
import WelcomeEmail from '../emails/WelcomeEmail.tsx';
import PasswordResetEmail from '../emails/PasswordResetEmail.tsx';

export type SendEmailOptions = {
	to: string | string[];
	subject: string;
	template: ReactElement;
	from?: string;
	replyTo?: string;
	cc?: string | string[];
	bcc?: string | string[];
	attachments?: Attachment[];
};

export type SendEmailResult = {
	messageId: string;
	accepted: string[];
	rejected: string[];
};

const PASSWORD_RESET_EXPIRY_MINUTES = 60;

const getClientBaseUrl = (): string => {
	const origin = (process.env.CORS_ORIGIN || 'http://localhost:3000')
		.split(',')[0]
		.trim();
	return origin.replace(/\/+$/, '');
};

/**
 * Renders a React Email template (HTML + plain text) and sends it through SES.
 */
export const sendEmail = async ({
	to,
	subject,
	template,
	from,
	replyTo,
	cc,
	bcc,
	attachments,
}: SendEmailOptions): Promise<SendEmailResult> => {
	try {
		const [html, text] = await Promise.all([
			render(template),
			render(template, { plainText: true }),
		]);

		const info = await getTransporter().sendMail({
			from: from ?? getMailConfig().fromEmail,
			to,
			cc,
			bcc,
			replyTo,
			subject,
			html,
			text,
			attachments,
		});

		logger.info('Email sent', {
			messageId: info.messageId,
			subject,
			recipients: Array.isArray(to) ? to.length : 1,
		});

		return {
			messageId: info.messageId,
			accepted: (info.accepted ?? []).map(String),
			rejected: (info.rejected ?? []).map(String),
		};
	} catch (error) {
		logger.error('Failed to send email', {
			subject,
			error: error instanceof Error ? error.message : String(error),
			stack: error instanceof Error ? error.stack : undefined,
		});
		throw new AppError('Failed to send email', 502);
	}
};

export const sendWelcomeEmail = (to: string, name: string) =>
	sendEmail({
		to,
		subject: 'Welcome!',
		template: WelcomeEmail({
			name,
			loginUrl: `${getClientBaseUrl()}/login`,
		}),
	});

export const sendPasswordResetEmail = (
	to: string,
	name: string,
	resetUrl: string,
	expiresInMinutes = PASSWORD_RESET_EXPIRY_MINUTES,
) =>
	sendEmail({
		to,
		subject: 'Reset your password',
		template: PasswordResetEmail({ name, resetUrl, expiresInMinutes }),
	});
