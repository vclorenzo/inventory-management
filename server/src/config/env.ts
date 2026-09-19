import dotenv from 'dotenv';
import path from 'path';

const envFile =
	process.env.NODE_ENV === 'test' ? '.env.test' : '.env';

dotenv.config({ path: path.resolve(process.cwd(), envFile) });

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
	throw new Error(
		'JWT_SECRET is required. Set it in the environment before starting the application.',
	);
}

export const JWT_SECRET = jwtSecret;
