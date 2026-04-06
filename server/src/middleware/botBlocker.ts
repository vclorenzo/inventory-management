// import logger from '#config/logger.ts';
// import { Request, Response, NextFunction } from 'express';

// const blockedAgents = ['curl', 'wget', 'python-requests', 'postman'];

// export const botBlocker = (req: Request, res: Response, next: NextFunction) => {
//   const ua = req.get('User-Agent')?.toLowerCase() || '';

//   if (blockedAgents.some(agent => ua.includes(agent))) {
//     logger.warn('Bot request blocked', {
//       ip: req.ip,
//       userAgent: ua,
//       path: req.path,
//     });

//     return res.status(403).json({
//       error: 'Forbidden',
//       message: 'Automated requests are not allowed',
//     });
//   }

//   next();
// };