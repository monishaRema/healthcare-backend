import { ErrorRequestHandler, NextFunction, Request, Response } from "express";
import { env } from "../config/env";
import status from "http-status";
import AppError from "../errorHelper/AppError";

export const globalErrorHandler: ErrorRequestHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) => {

  if (env.NODE_ENV === "development") {
    console.log(err);
  }

  let statusCode =
    err instanceof Error && "statusCode" in err && typeof err.statusCode === "number"
      ? err.statusCode
      : status.INTERNAL_SERVER_ERROR;
  let message = err instanceof Error ? err.message : "Internal Server Error";


  if(err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  }


  void req;
  void next;

  res.status(statusCode).json({
    success: false,
    message:
      statusCode === status.INTERNAL_SERVER_ERROR
        ? "Internal Server error"
        : message,
    error: message,
  });
};
