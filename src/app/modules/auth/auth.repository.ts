import type { Patient, Prisma } from "../../../generated/prisma/client";
import type { IRegisterPatientPayload } from "./auth.types";

export const AuthRepository = {
  createPatient: async function (
    payload: IRegisterPatientPayload,
    prismaTx: Prisma.TransactionClient,
  ): Promise<Patient> {
    const data: Prisma.PatientUncheckedCreateInput = {
      name: payload.name,
      email: payload.email,
      profilePhoto: payload.profilePhoto ?? null,
      contactNumber: payload.contactNumber ?? null,
      address: payload.address ?? null,
      userId: payload.userId,
    };

    return prismaTx.patient.create({ data });
  },
};
