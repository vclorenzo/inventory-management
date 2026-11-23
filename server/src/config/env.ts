import dotenv from 'dotenv';
import path from 'path';

const envFile =
	process.env.NODE_ENV === 'test' ? '.env.test' : '.env';

dotenv.config({ path: path.resolve(process.cwd(), envFile) });

const requireEnv = (name: string): string => {
	const value = process.env[name]?.trim();
	if (!value) {
		throw new Error(
			`${name} is required. Set it in the environment before starting the application.`,
		);
	}
	return value;
};

export const JWT_SECRET = requireEnv('JWT_SECRET');

export type MailConfig = {
	accessKeyId: string;
	secretAccessKey: string;
	region: string;
	fromEmail: string;
};

/**
 * AWS SES settings. Validated lazily (on first use) so the server can still
 * boot when email is not configured yet.
 */
export const getMailConfig = (): MailConfig => ({
	accessKeyId: requireEnv('AWS_ACCESS_KEY_ID'),
	secretAccessKey: requireEnv('AWS_SECRET_ACCESS_KEY'),
	region: requireEnv('AWS_REGION'),
	fromEmail: requireEnv('SES_FROM_EMAIL'),
});
