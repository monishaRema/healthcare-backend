import type { Patient, Prisma } from "../../../generated/prisma/client";
import { ISessionUser } from "../../interfaces/session.interface";
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

  getUserByEmail: async function (email: string) {
    return prisma.user.findUnique({
      where: {
        email,
      },
    });
  },
  getPatientByUserId: async function (id: string) {
    return prisma.patient.findUnique({
      where: {
        userId: id,
      },
    });
  },
  createPatientFromGoogle: async function (session: ISessionUser) {
    return await prisma.patient.create({
      data: {
        userId: session.user.id,
        name: session.user.name,
        email: session.user.email,
        profilePhoto: session.user.image ?? null,
      },
    });
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

  updateUserPasswordChangeFlag: async (id: string, flag: boolean) => {
    await prisma.user.update({
      where: {
        id: id,
      },
      data: {
        needPasswordChange: flag,
      },
    });
  },

  deleteUserSessions: async function (userId: string) {
    await prisma.session.deleteMany({
      where: {
        userId: userId,
      },
    });
  },
  getAccountDetailsByUserId: async function (userId: string) {
    return await prisma.account.findFirst({
      where: {
        userId,
      },
      select: {
        id: true,
        accountId: true,
        providerId: true,
        userId: true,
      },
    });
  },
};
