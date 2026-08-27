import { AppError } from '#error/AppError.ts'
import { NextFunction, Request, Response } from 'express'

const MAX_LIMIT = 50

const queryScalar = (value: unknown): unknown =>
	Array.isArray(value) ? value[0] : value

const parseOptionalInt = (value: unknown): number | undefined => {
	const raw = queryScalar(value)
	if (raw === undefined || raw === '') return undefined

	const parsed = Number(raw)
	if (!Number.isSafeInteger(parsed)) {
		throw new AppError(
			'Pagination page and limit must be finite integers',
			400,
		)
	}

	return parsed
}

export const parseReviewPagination = (
	req: Request,
	_res: Response,
	next: NextFunction,
) => {
	try {
		const parsedPage = parseOptionalInt(req.query.page)
		const page = Math.max(parsedPage ?? 1, 1)
		const parsedLimit = parseOptionalInt(req.query.limit)
		const limit =
			parsedLimit !== undefined
				? Math.min(Math.max(parsedLimit, 1), MAX_LIMIT)
				: undefined

		req.pagination = { page, limit }
		next()
	} catch (error) {
		next(error)
	}
}
