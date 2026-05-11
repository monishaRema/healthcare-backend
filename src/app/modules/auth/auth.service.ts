import { UserStatus } from "../../../generated/prisma/enums";
import { auth } from "../../lib/auth";
import { ILoginUserPayload, IRegisterUserPayload } from "./auth.types";

export const AuthService = {
  registerPatient: async function (payload: IRegisterUserPayload) {
    const { name, email, password } = payload;

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
