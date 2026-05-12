import { IRegisterPatientPayload } from "./auth.types";
export const AuthRepository = {
  createPatient: async function (
    payload: IRegisterPatientPayload,
    prismaTx: any,
  ) {
    return await prismaTx.patient.create({
      data: {
        name: payload.name,
        email: payload.email,
        userId: payload.userId,
      },
    });
  },
};
