import { Response } from "express";

export interface Meta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface ResponseType<T> {
  res: Response;
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
  meta?: Meta;
}

export const sendResponse = <T>(responseData: ResponseType<T>) => {
  const {
    res,
    success,
    statusCode,
    message,
    data = null,
    meta = null,
  } = responseData;

  res.status(statusCode).json({
    success,
    message,
    data,
    meta,
  });
};
