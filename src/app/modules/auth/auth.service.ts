import { UserStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { auth } from "../../lib/auth";
import { ILoginUserPayload, IRegisterUserPayload } from "./auth.types";

export const AuthService = {
  registerPatient: async function (payload: IRegisterUserPayload) {
    const { name, email, password, contactNumber, address, profilePhoto } =
      payload;

    const result = await auth.api.signUpEmail({
      body: {
        name,
        email,
        password,
        //default values
        // needsPasswordChange: false,
        // role: Role.PATIENT
      },
    });
    if (!result.user) {
      throw new Error("User creation failed");
    }

    await prisma.patient.upsert({
      where: {
        userId: result.user.id,
      },
      update: {
        name,
        email,
        profilePhoto: profilePhoto ?? result.user.image ?? null,
        contactNumber: contactNumber ?? "PENDING",
        address: address ?? null,
      },
      create: {
        name,
        email,
        profilePhoto: profilePhoto ?? result.user.image ?? null,
        contactNumber: contactNumber ?? "PENDING",
        address: address ?? null,
        userId: result.user.id,
      },
    });

    return result;
  },

  loginUser: async function (payload: ILoginUserPayload) {

    const {email,password} = payload
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

    return data
  },
};
