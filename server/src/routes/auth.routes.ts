import { signup } from '#controllers/auth.controller.ts';
import express from 'express';

const router = express.Router();

router.post('/sign-up', signup);
// router.post('/sign-in', signin);
// router.post('/sign-out', signout);

export default router;
