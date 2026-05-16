import { JwtPayload, SignOptions } from "jsonwebtoken";
import { jwtUtils } from "./jwt";
import { env } from "../config/env";
import { CookieUtils } from "./cookie";
import { Response } from "express";

export const tokenUtils = {
  getAccessToken: (payload: JwtPayload) => {
    const accessToken = jwtUtils.createToken(payload, env.ACCESS_TOKEN_SECRET, {
      expiresIn: env.ACCESS_TOKEN_EXPIRES_IN,
    } as SignOptions);
    return accessToken;
  },

  getRefreshToken: (payload: JwtPayload) => {
    const refreshToken = jwtUtils.createToken(
      payload,
      env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: env.REFRESH_TOKEN_EXPIRES_IN,
      } as SignOptions,
    );
    return refreshToken;
  },

  setAccessTokenCookie: (res: Response, token: string) => {
    CookieUtils.setCookie(res, "accessToken", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      maxAge: 1000 * 60 * 60 * 24,
    });
  },

  setRefreshTokenCookie: (res: Response, token: string) => {
    CookieUtils.setCookie(res, "refreshToken", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });
  },

  setBetterAuthSessionCookie: (res: Response, token: string) => {
    CookieUtils.setCookie(res, "better-auth.session_token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      maxAge: 1000 * 60 * 60 * 24,
    });
  },
};
