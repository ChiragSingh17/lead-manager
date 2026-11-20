import express from 'express';
import rateLimit from 'express-rate-limit';
import { body } from 'express-validator';
import { login, me, register } from '../controllers/auth.controller.js';
import { env } from '../config/env.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skip: () => env.nodeEnv === 'test',
  message: { message: 'Too many authentication attempts. Please try again later.' },
});

const emailRule = body('email')
  .trim()
  .isEmail()
  .withMessage('Enter a valid email address.')
  .normalizeEmail();

const passwordRule = body('password')
  .isLength({ min: 8, max: 72 })
  .withMessage('Password must be between 8 and 72 characters.')
  .matches(/^(?=.*[A-Za-z])(?=.*\d).+$/)
  .withMessage('Password must include at least one letter and one number.');

router.post(
  '/register',
  authLimiter,
  body('name')
    .trim()
    .isLength({ min: 2, max: 60 })
    .withMessage('Name must be between 2 and 60 characters.'),
  emailRule,
  passwordRule,
  validate,
  register,
);

router.post(
  '/login',
  authLimiter,
  body('email').trim().isEmail().withMessage('Enter a valid email address.').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required.'),
  validate,
  login,
);

router.get('/me', protect, me);

export default router;
