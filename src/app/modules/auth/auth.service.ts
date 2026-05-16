import {  UserStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { auth } from "../../lib/auth";
import { ILoginUserPayload, IRegisterUserPayload } from "./auth.types";
import { AuthRepository } from "./auth.repository";
import AppError from "../../errorHelper/AppError";
import status from "http-status";
import { tokenUtils } from "../../utils/token";




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
};
