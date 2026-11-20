import User from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { verifyToken } from '../utils/token.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const protect = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    throw new ApiError(401, 'Authentication required.');
  }

  try {
    const payload = verifyToken(header.slice(7));
    const user = await User.findById(payload.sub).select('name email');

    if (!user) {
      throw new ApiError(401, 'Your session is no longer valid.');
    }

    req.user = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
    };
    next();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(401, 'Invalid or expired session.');
  }
});
