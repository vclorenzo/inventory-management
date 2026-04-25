import {
	changePassword,
	me,
	signin,
	signout,
	signup,
} from '#controllers/auth.controller.ts';
import { authenticateToken } from '#middleware/auth.middleware.ts';
import { validate } from '#middleware/validate.middleware.ts';
import {
	changePasswordSchema,
	signinSchema,
	signupSchema,
} from '#validations/auth.validations.ts';
import express from 'express';

const router = express.Router();

router.post('/sign-up', validate(signupSchema), signup);
router.post('/sign-in', validate(signinSchema), signin);
router.post('/sign-out', signout);
router.get('/me', authenticateToken, me);
router.put(
	'/change-password',
	authenticateToken,
	validate(changePasswordSchema),
	changePassword,
);

export default router;
