import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2';
import nodemailer, { type Transporter } from 'nodemailer';
import { getMailConfig } from '#config/env.ts';

let transporter: Transporter | null = null;

/** Lazily-created nodemailer transport backed by AWS SES (v2). */
export const getTransporter = (): Transporter => {
	if (transporter) return transporter;

	const { accessKeyId, secretAccessKey, region } = getMailConfig();

	const sesClient = new SESv2Client({
		region,
		credentials: { accessKeyId, secretAccessKey },
	});

	transporter = nodemailer.createTransport({
		SES: { sesClient, SendEmailCommand },
	});

	return transporter;
};
