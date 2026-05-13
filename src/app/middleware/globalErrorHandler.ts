import { ErrorRequestHandler, NextFunction, Request, Response } from "express";
import { env } from "../config/env";
import status from "http-status";

export const globalErrorHandler: ErrorRequestHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) => {

  if (env.NODE_ENV === "development") {
    console.log(err);
  }

  const statusCode =
    err instanceof Error && "statusCode" in err && typeof err.statusCode === "number"
      ? err.statusCode
      : status.INTERNAL_SERVER_ERROR;
  const message = err instanceof Error ? err.message : "Internal Server Error";

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
