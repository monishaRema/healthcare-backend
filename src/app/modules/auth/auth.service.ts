import { UserStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { auth } from "../../lib/auth";
import {
  IChangePasswordPayload,
  ILoginUserPayload,
  IRegisterUserPayload,
} from "./auth.types";
import { AuthRepository } from "./auth.repository";
import AppError from "../../errorHelper/AppError";
import status from "http-status";
import { tokenUtils } from "../../utils/token";
import { IRequestUser } from "../../interfaces/reqUser.interface";
import { jwtUtils } from "../../utils/jwt";
import { env } from "../../config/env";
import { JwtPayload } from "jsonwebtoken";

export const AuthService = {
  registerPatient: async function (payload: IRegisterUserPayload) {
    const { name, email, password } = payload;

    const result = await auth.api.signUpEmail({
      body: {
        name,
        email,
        password,
      },
    });
    if (!result.user) {
      throw new AppError(status.INTERNAL_SERVER_ERROR, "Failed to create user");
    }

    try {
      const patient = await prisma.$transaction(async (prismaTx) => {
        const patient = await AuthRepository.createPatient(
          {
            name: result.user.name,
            email: result.user.email,
            userId: result.user.id,
          },
          prismaTx,
        );
        return patient;
      });

      return {
        ...result,
        patient,
      };
    } catch (error) {
      console.error("Transaction failed:", error);
      await prisma.user.delete({
        where: {
          id: result.user.id,
        },
      });

      throw new AppError(
        status.INTERNAL_SERVER_ERROR,
        "Failed to create patient profile",
      );
    }
  },

  loginUser: async function (payload: ILoginUserPayload) {
    const { email, password } = payload;
    const data = await auth.api.signInEmail({
      body: {
        email,
        password,
      },
    });
    if (data.user.status === UserStatus.BLOCKED) {
      throw new AppError(status.FORBIDDEN, "User is blocked");
    }
    if (data.user.isDeleted || data.user.status === UserStatus.DELETED) {
      throw new AppError(status.NOT_FOUND, "User is deleted");
    }

    const accessToken = tokenUtils.getAccessToken({
      userId: data.user.id,
      email: data.user.email,
      name: data.user.name,
      role: data.user.role,
      status: data.user.status,
      isDeleted: data.user.isDeleted,
      emailVerified: data.user.emailVerified,
    });
    const refreshToken = tokenUtils.getRefreshToken({
      userId: data.user.id,
      email: data.user.email,
      name: data.user.name,
      role: data.user.role,
      status: data.user.status,
      isDeleted: data.user.isDeleted,
      emailVerified: data.user.emailVerified,
    });

    return {
      ...data,
      accessToken,
      refreshToken,
    };
  },

  getMe: async function (user: IRequestUser) {
    const isUserExists = await AuthRepository.getMe(user.userId);

    if (!isUserExists) {
      throw new AppError(status.NOT_FOUND, "User not found");
    }
    return isUserExists;
  },
  getNewToken: async function (refreshToken: string, sessionToken: string) {
    const isSessionTokenExists = await AuthRepository.getNewToken(sessionToken);

    if (!isSessionTokenExists) {
      throw new AppError(status.UNAUTHORIZED, "Invalid session token");
    }

    const verifiedRefreshToken = jwtUtils.verifyToken(
      refreshToken,
      env.REFRESH_TOKEN_SECRET,
    );

    if (!verifiedRefreshToken.success && verifiedRefreshToken.error) {
      throw new AppError(status.UNAUTHORIZED, "Invalid refresh token");
    }

    const data = verifiedRefreshToken.decoded as JwtPayload;

    const newAccessToken = tokenUtils.getAccessToken({
      userId: data.userId,
      role: data.role,
      name: data.name,
      email: data.email,
      status: data.status,
      isDeleted: data.isDeleted,
      emailVerified: data.emailVerified,
    });

    const newRefreshToken = tokenUtils.getRefreshToken({
      userId: data.userId,
      role: data.role,
      name: data.name,
      email: data.email,
      status: data.status,
      isDeleted: data.isDeleted,
      emailVerified: data.emailVerified,
    });

    const session = await AuthRepository.updateSessionExpiry(sessionToken);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      sessionToken: session.token,
    };
  },

  changePassword: async (
    payload: IChangePasswordPayload,
    sessionToken: string,
  ) => {
    if (!sessionToken) {
      throw new AppError(status.UNAUTHORIZED, "Invalid session token");
    }

    const session = await auth.api.getSession({
      headers: new Headers({
        Authorization: `Bearer ${sessionToken}`,
      }),
    });

    if (!session) {
      throw new AppError(status.UNAUTHORIZED, "Invalid session token");
    }

    const { currentPassword, newPassword } = payload;

    const result = await auth.api.changePassword({
      body: {
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      },
      headers: new Headers({
        Authorization: `Bearer ${sessionToken}`,
      }),
    });

    await AuthRepository.updatePassword(session.user.id);

    const accessToken = tokenUtils.getAccessToken({
      userId: session.user.id,
      role: session.user.role,
      name: session.user.name,
      email: session.user.email,
      status: session.user.status,
      isDeleted: session.user.isDeleted,
      emailVerified: session.user.emailVerified,
    });

    const refreshToken = tokenUtils.getRefreshToken({
      userId: session.user.id,
      role: session.user.role,
      name: session.user.name,
      email: session.user.email,
      status: session.user.status,
      isDeleted: session.user.isDeleted,
      emailVerified: session.user.emailVerified,
    });

    return {
      ...result,
      accessToken,
      refreshToken,
      sessionToken,
    };
  },

  logoutUser: async (sessionToken: string) => {
    const result = await auth.api.signOut({
      headers: new Headers({
        Authorization: `Bearer ${sessionToken}`,
      }),
    });

    return result;
  },

  verifyEmail: async (email: string, otp: string) => {
    return await auth.api.verifyEmailOTP({
      body: {
        email,
        otp,
      },
    });
  },
};
