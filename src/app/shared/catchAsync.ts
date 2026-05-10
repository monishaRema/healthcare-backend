import { NextFunction, Request, RequestHandler, Response } from "express";

export function catchAsync(fn: RequestHandler) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      fn(req, res, next)

    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Fetch failed",
        error: error.message,
      });
    }
  };
}