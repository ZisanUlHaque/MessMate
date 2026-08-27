import { ZodObject, ZodError } from "zod";
import { Request, Response, NextFunction } from "express";
export const validate =
  (schema: ZodObject) => (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError)
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: error.flatten().fieldErrors,
        });
      else next(error);
    }
  };
