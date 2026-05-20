import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { AuthService } from "./auth.service";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";
import { tokenUtils } from "../../utils/token";
import AppError from "../../errorHelper/AppError";
import { CookieUtils } from "../../utils/cookie";
import { env } from "../../config/env";
import { auth } from "../../lib/auth";

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

  changePassword: catchAsync(async (req: Request, res: Response) => {
    const payload = req.body;
    const betterAuthSessionToken = req.cookies["better-auth.session_token"];

    if (!betterAuthSessionToken) {
      throw new AppError(status.UNAUTHORIZED, "Session token is missing");
    }

    const result = await AuthService.changePassword(
      payload,
      betterAuthSessionToken,
    );

    const { accessToken, refreshToken, sessionToken } = result;

    tokenUtils.setAccessTokenCookie(res, accessToken);
    tokenUtils.setRefreshTokenCookie(res, refreshToken);
    tokenUtils.setBetterAuthSessionCookie(res, sessionToken);

    sendResponse({
      res,
      statusCode: status.OK,
      success: true,
      message: "Password changed successfully",
      data: result,
    });
  }),
  logoutUser: catchAsync(async (req: Request, res: Response) => {
    const betterAuthSessionToken = req.cookies["better-auth.session_token"];
    const result = await AuthService.logoutUser(betterAuthSessionToken);
    CookieUtils.clearCookie(res, "accessToken", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });
    CookieUtils.clearCookie(res, "refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });
    CookieUtils.clearCookie(res, "better-auth.session_token", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });
    sendResponse({
      res,
      statusCode: status.OK,
      success: true,
      message: "User logged out successfully",
      data: result,
    });
  }),

  verifyEmail: catchAsync(async (req: Request, res: Response) => {
    const { email, otp } = req.body;

    await AuthService.verifyEmail(email, otp);
    sendResponse({
      res,
      statusCode: status.OK,
      success: true,
      message: "Email verified successfully",
    });
  }),

  forgetPassword: catchAsync(async (req: Request, res: Response) => {
    const { email } = req.body;
    await AuthService.forgetPassword(email);

    sendResponse({
      res,
      statusCode: status.OK,
      success: true,
      message: "Password reset OTP sent to email successfully",
    });
  }),

  resetPassword: catchAsync(async (req: Request, res: Response) => {
    const { email, otp, newPassword } = req.body;
    await AuthService.resetPassword(email, otp, newPassword);

    sendResponse({
      res,
      statusCode: status.OK,
      success: true,
      message: "Password reset successfully",
    });
  }),

  googleLoginSuccess: catchAsync(async (req: Request, res: Response) => {
    const redirectPath = (req.query.redirect as string) || "/dashboard";

    const sessionToken = req.cookies["better-auth.session_token"];

    if (!sessionToken) {
      return res.redirect(`${env.FRONTEND_URL}/login?error=oauth_failed`);
    }

    const session = await auth.api.getSession({
      headers: {
        Cookie: `better-auth.session_token=${sessionToken}`,
      },
    });

    if (!session) {
      return res.redirect(`${env.FRONTEND_URL}/login?error=no_session_found`);
    }

    if (session && !session.user) {
      return res.redirect(`${env.FRONTEND_URL}/login?error=no_user_found`);
    }

    const result = await AuthService.googleLoginSuccess(session);

    const { accessToken, refreshToken } = result;

    tokenUtils.setAccessTokenCookie(res, accessToken);
    tokenUtils.setRefreshTokenCookie(res, refreshToken);
    // ?redirect=//profile -> /profile
    const isValidRedirectPath =
      redirectPath.startsWith("/") && !redirectPath.startsWith("//");
    const finalRedirectPath = isValidRedirectPath ? redirectPath : "/dashboard";

    res.redirect(`${env.FRONTEND_URL}${finalRedirectPath}`);
  }),

  handleOAuthError: catchAsync((req: Request, res: Response) => {
    const error = (req.query.error as string) || "oauth_failed";
    res.redirect(`${env.FRONTEND_URL}/login?error=${error}`);
  }),
};
