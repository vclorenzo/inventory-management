import { Request, Response, NextFunction } from "express"
import { ZodType } from "zod"

export const validate =
  (schema: ZodType<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body)
      next()
    } catch (error: any) {
      res.status(400).json({
        message: 'Validation error',
        errors: error.errors ?? error.issues,
      })
    }
  }