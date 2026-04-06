import logger from '#config/logger.ts';
import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';

type Role = 'admin' | 'user' | 'guest';

const createLimiter = (role: Role, max: number) =>
  rateLimit({
    windowMs: 60 * 1000,
    max,
    standardHeaders: true,
    legacyHeaders: false,

    handler: (req: Request, res: Response) => {
      logger.warn('Rate limit exceeded', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.path,
        role,
      });

      res.status(429).json({
        error: 'Too many requests',
        message: `${role} request limit exceeded`,
      });
    },
  });

const limiters = {
  admin: createLimiter('admin', 20),
  user: createLimiter('user', 10),
  guest: createLimiter('guest', 5),
};

export const securityMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const rawRole = req.user?.role;

  const role: Role = (req.user?.role as Role) ?? 'guest';

  return limiters[role](req, res, next);
};

export default securityMiddleware;