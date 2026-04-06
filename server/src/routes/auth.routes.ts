import { signin, signout, signup } from '#controllers/auth.controller.ts';
import { validate } from '#middleware/validate.middleware.ts';
import { signinSchema, signupSchema } from '#validations/auth.validations.ts';
import express from 'express';

const router = express.Router();

router.post('/sign-up', validate(signupSchema), signup);
router.post('/sign-in', validate(signinSchema), signin);
router.post('/sign-out', signout);

export default router;
