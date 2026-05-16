import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { AuthService } from "./auth.service";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";
import { tokenUtils } from "../../utils/token";

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
};
