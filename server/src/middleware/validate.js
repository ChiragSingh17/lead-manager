import { validationResult } from 'express-validator';
import mongoose from 'mongoose';

export function validateObjectId(req, res, next) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: 'Invalid lead identifier.' });
  }
  return next();
}

export function validate(req, res, next) {
  const result = validationResult(req);

  if (result.isEmpty()) return next();

  const errors = result.array().map((error) => ({
    field: error.path,
    message: error.msg,
  }));

  return res.status(422).json({
    message: 'Please check the highlighted fields.',
    errors,
  });
}
