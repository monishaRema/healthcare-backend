import { Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

export const UserRepository = {
  // find user by email
  findUserByEmail: async (email: string) => {
    return await prisma.user.findUnique({
      where: {
        email: email,
      },
    });
  },

  //   find doctor by registration number
  findDoctorByRegistrationNumber: async (registrationNumber: string) => {
    return await prisma.doctor.findUnique({
      where: {
        registrationNumber: registrationNumber,
      },
    });
  },

  //   create Admin
  createAdmin: async (
    adminData: Prisma.AdminCreateManyInput,
    tx: Prisma.TransactionClient,
  ) => {
    return await tx.admin.create({
      data: adminData,
    });
  },

  //   find admin by id
  findAdminById: async (adminId: string, tx: Prisma.TransactionClient) => {
    return await tx.admin.findUnique({
      where: {
        id: adminId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        profilePhoto: true,
        contactNumber: true,
        isDeleted: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
          },
        },
      },
    });
  },

  //    delete user by id
  deleteUserById: async (userId: string) => {
    return await prisma.user.delete({
      where: {
        id: userId,
      },
    });
  },
};
