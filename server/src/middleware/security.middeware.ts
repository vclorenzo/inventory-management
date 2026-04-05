// import rateLimit from 'express-rate-limit';
// import helmet from 'helmet';
// import isbot from 'isbot';
// import logger from '#config/logger.js';

// export const securityHeaders = helmet();

// export const securityMiddleware = (req, res, next) => {
// 	const role = req.user?.role || 'guest';

// 	let limit;
// 	let message;

// 	switch (role) {
// 		case 'admin':
// 			limit = 20;
// 			message = 'Admin request limit exceeded (20 per minute). Slow down';
// 			break;

// 		case 'user':
// 			limit = 10;
// 			message = 'User request limit exceeded (10 per minute). Slow down';
// 			break;

// 		case 'guest':
// 			limit = 5;
// 			message = 'Guest request limit exceeded (5 per minute). Slow down';
// 			break;
// 	}

// 	const limiter = rateLimit({
// 		windowMs: 60 * 1000,
// 		max: limit,
// 		keyGenerator: () => req.ip,
// 		handler: (req, res) => {
// 			logger.warn('Rate limit exceeded', {
// 				ip: req.ip,
// 				userAgent: req.get('User-Agent'),
// 				path: req.path,
// 			});

// 			return res.status(429).json({
// 				error: 'Too Many Requests',
// 				message,
// 			});
// 		},
// 	});

// 	limiter(req, res, () => {
// 		const userAgent = req.get('User-Agent');

// 		if (isbot(userAgent)) {
// 			logger.warn('Bot request blocked', {
// 				ip: req.ip,
// 				userAgent,
// 				path: req.path,
// 			});

// 			return res.status(403).json({
// 				error: 'Forbidden',
// 				message: 'Automated requests are not allowed',
// 			});
// 		}

// 		next();
// 	});
// };
