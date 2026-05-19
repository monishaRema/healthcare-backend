import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { AuthService } from "./auth.service";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";
import { tokenUtils } from "../../utils/token";
import AppError from "../../errorHelper/AppError";

export const AuthController = {
  registerPatient: catchAsync(async (req: Request, res: Response) => {
    const result = await AuthService.registerPatient(req.body);
    sendResponse({
      res,
      statusCode: status.CREATED,
      success: true,
      message: "User Created Successfully",
      data: result,
    });
  }),
  loginUser: catchAsync(async (req: Request, res: Response) => {
    const result = await AuthService.loginUser(req.body);
    const { accessToken, refreshToken, token, ...rest } = result;

    tokenUtils.setAccessTokenCookie(res, accessToken);
    tokenUtils.setRefreshTokenCookie(res, refreshToken);
    tokenUtils.setBetterAuthSessionCookie(res, token);

    sendResponse({
      res,
      statusCode: 200,
      success: true,
      message: "User Login Successfully",
      data: {
        token,
        accessToken,
        refreshToken,
        ...rest,
      },
    });
  }),

  getMe: catchAsync(async (req: Request, res: Response) => {
    const user = req.user;

    if (!user) {
      throw new AppError(status.UNAUTHORIZED, "Unauthorized access");
    }

    const result = await AuthService.getMe(user);
    sendResponse({
      res,
      statusCode: status.OK,
      success: true,
      message: "User profile fetched successfully",
      data: result,
    });
  }),

  getNewToken: catchAsync(async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;
    const betterAuthSessionToken = req.cookies["better-auth.session_token"];
    if (!refreshToken) {
      throw new AppError(status.UNAUTHORIZED, "Refresh token is missing");
    }
    const result = await AuthService.getNewToken(
      refreshToken,
      betterAuthSessionToken,
    );

    const { accessToken, refreshToken: newRefreshToken, sessionToken } = result;

    tokenUtils.setAccessTokenCookie(res, accessToken);
    tokenUtils.setRefreshTokenCookie(res, newRefreshToken);
    tokenUtils.setBetterAuthSessionCookie(res, sessionToken);

    sendResponse({
      res,
      statusCode: status.OK,
      success: true,
      message: "New tokens generated successfully",
      data: {
        accessToken,
        refreshToken: newRefreshToken,
        sessionToken,
      },
    });
  }),
};
