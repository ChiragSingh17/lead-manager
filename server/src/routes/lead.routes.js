import express from 'express';
import { body } from 'express-validator';
import {
  createLead,
  deleteLead,
  getLead,
  getLeadStats,
  listLeads,
  updateLead,
} from '../controllers/lead.controller.js';
import { protect } from '../middleware/auth.js';
import { validate, validateObjectId } from '../middleware/validate.js';
import { LEAD_SOURCES, LEAD_STATUSES } from '../utils/constants.js';

const router = express.Router();

const nameRule = (chain) =>
  chain.trim().isLength({ min: 2, max: 120 }).withMessage('Name must be between 2 and 120 characters.');

const emailRule = (chain) =>
  chain.trim().isEmail().withMessage('Enter a valid email address.').normalizeEmail();

const phoneRule = (chain) =>
  chain
    .trim()
    .matches(/^[+()\d\s-]{7,30}$/)
    .withMessage('Enter a valid phone number.');

const companyRule = (chain) =>
  chain
    .trim()
    .isLength({ min: 2, max: 120 })
    .withMessage('Company must be between 2 and 120 characters.');

const sourceRule = (chain) =>
  chain.isIn(LEAD_SOURCES).withMessage('Choose a valid lead source.');

const statusRule = (chain) =>
  chain.isIn(LEAD_STATUSES).withMessage('Choose a valid lead status.');

const createRules = [
  nameRule(body('name')),
  emailRule(body('email')),
  phoneRule(body('phone')),
  companyRule(body('company')),
  sourceRule(body('source')),
  statusRule(body('status')),
];

const updateRules = [
  body().custom((value) => {
    const allowed = ['name', 'email', 'phone', 'company', 'source', 'status'];
    const hasField = allowed.some((field) => value[field] !== undefined);
    if (!hasField) throw new Error('Provide at least one field to update.');
    return true;
  }),
  nameRule(body('name').optional()),
  emailRule(body('email').optional()),
  phoneRule(body('phone').optional()),
  companyRule(body('company').optional()),
  sourceRule(body('source').optional()),
  statusRule(body('status').optional()),
];

router.use(protect);

router.get('/stats', getLeadStats);

router
  .route('/')
  .get(listLeads)
  .post(createRules, validate, createLead);

router
  .route('/:id')
  .all(validateObjectId)
  .get(getLead)
  .patch(updateRules, validate, updateLead)
  .delete(deleteLead);

export default router;
