import { Request, Response, NextFunction } from "express";
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";
  if (err.code === "P2002") {
    statusCode = 409;
    message = `Duplicate field value: ${err.meta?.target}`;
  } else if (err.code === "P2025") {
    statusCode = 404;
    message = "Record not found";
  } else if (err.code === "P2003" || err.code === "P2014") {
    statusCode = 400;
    message = "Relation violation";
  } else if (
    err.name === "JsonWebTokenError" ||
    err.name === "TokenExpiredError"
  ) {
    statusCode = 401;
    message = "Invalid or expired token";
  }
  res
    .status(statusCode)
    .json({
      success: false,
      message,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
};
