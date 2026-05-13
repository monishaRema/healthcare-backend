import { NextFunction, Request, Response } from "express";
import status from "http-status";

export const notFound = (req: Request, res: Response, next: NextFunction) => {

  void next;

  res.status(status.NOT_FOUND).json({
    success: false,
    message: `Route not found => ${req.method} : ${req.originalUrl}`,
  });
};
