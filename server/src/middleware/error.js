import { env } from '../config/env.js';

export function notFound(req, res) {
  res.status(404).json({ message: `Route ${req.method} ${req.originalUrl} not found.` });
}

export function errorHandler(error, _req, res, _next) {
  let status = error.statusCode || error.status || 500;
  let message = error.message || 'Something went wrong.';
  let errors = error.errors;

  if (error.name === 'ValidationError') {
    status = 422;
    message = 'Please check the highlighted fields.';
    errors = Object.values(error.errors).map((item) => ({
      field: item.path,
      message: item.message,
    }));
  }

  if (error.name === 'CastError') {
    status = 400;
    message = 'Invalid resource identifier.';
  }

  if (error.code === 11000) {
    status = 409;
    message = 'An account with that email already exists.';
  }

  if (status >= 500 && env.nodeEnv !== 'test') {
    console.error(error);
  }

  const body = { message };
  if (errors) body.errors = errors;

  res.status(status).json(body);
}
