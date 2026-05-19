import type { Patient, Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import type { IRegisterPatientPayload } from "./auth.types";

const userProfileInclude = {
  patient: {
    include: {
      appointments: true,
      reviews: true,
      prescriptions: true,
      medicalReports: true,
      patientHealthData: true,
    },
  },
  doctor: {
    include: {
      specialties: true,
      appointments: true,
      reviews: true,
      prescriptions: true,
    },
  },
  admin: true,
} satisfies Prisma.UserInclude;

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

  getMe: async function (userId: string) {
    return prisma.user.findUnique({
      where: {
        id: userId,
        isDeleted: false,
      },
      include: userProfileInclude,
    });
  },
  getNewToken: async function (sessionToken: string) {
    return prisma.session.findUnique({
      where: {
        token: sessionToken,
      },
      include: {
        user: true,
      },
    });
  },

  updateSessionExpiry: async function (sessionToken: string) {
    return prisma.session.update({
      where: {
        token: sessionToken,
      },
      data: {
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
      },
      include: {
        user: true,
      },
    });
  },
  updatePassword: async function (userId: string) {
    return prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        needPasswordChange: false,
      },
    });
  },
};
