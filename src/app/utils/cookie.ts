import { CookieOptions, Request, Response } from "express";

export const CookieUtils = {
  setCookie: (
    res: Response,
    key: string,
    value: string,
    options: CookieOptions,
  ) => {
    res.cookie(key, value, options);
  },

  getCookie: (req: Request, key: string) => {
    return req.cookies[key];
  },

  clearCookie: (res: Response, key: string, options: CookieOptions) => {
    res.clearCookie(key, options);
  },

  
};
