import { UserStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { auth } from "../../lib/auth";
import { ILoginUserPayload, IRegisterUserPayload } from "./auth.types";
import { AuthRepository } from "./auth.repository";

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
      throw new Error("User creation failed");
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

      throw new Error("Transaction failed: " + error);
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
      throw new Error("User is blocked");
    }
    if (data.user.isDeleted || data.user.status === UserStatus.DELETED) {
      throw new Error("User is deleted");
    }

    return data;
  },
};
