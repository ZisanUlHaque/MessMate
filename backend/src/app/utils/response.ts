import { Response } from "express";
export const sendSuccess = (
  res: Response,
  data: any,
  message = "Success",
  statusCode = 200,
) => res.status(statusCode).json({ success: true, message, data });
export const sendPaginated = (
  res: Response,
  data: any,
  meta: any,
  message = "Success",
) => res.status(200).json({ success: true, message, data, pagination: meta });
export const sendCreated = (res: Response, data: any, message = "Created") =>
  sendSuccess(res, data, message, 201);
