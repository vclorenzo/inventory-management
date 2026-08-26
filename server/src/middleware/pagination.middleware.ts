import { NextFunction, Request, Response } from 'express'

const MAX_LIMIT = 50

export const parseReviewPagination = (
	req: Request,
	_res: Response,
	next: NextFunction,
) => {
	const page = Math.max(Number(req.query.page) || 1, 1)
	const parsedLimit = Number(req.query.limit)
	const limit =
		req.query.limit !== undefined && !Number.isNaN(parsedLimit)
			? Math.min(Math.max(parsedLimit, 1), MAX_LIMIT)
			: undefined

	req.pagination = { page, limit }
	next()
}
