import status from "http-status";
import AppError from "../../errorHelper/AppError";
import { prisma } from "../../lib/prisma";
import { IUpdateAdminPayload } from "./admin.interface";
import { IRequestUser } from "../../interfaces/reqUser.interface";
import { UserStatus } from "../../../generated/prisma/enums";

export const AdminService = {
  getAllAdmins: async () => {
    const admins = await prisma.admin.findMany({
      where: {
        isDeleted: false,
      },
      include: {
        user: true,
      },
    });
    return admins;
  },

  getAdminById: async (id: string) => {
    const admin = await prisma.admin.findFirst({
      where: {
        id,
        isDeleted: false,
      },
      include: {
        user: true,
      },
    });
    return admin;
  },

  updateAdmin: async (id: string, payload: IUpdateAdminPayload) => {
    //TODO: Validate who is updating the admin user. Only super admin can update admin user and only super admin can update super admin user but admin user cannot update super admin user

    const isAdminExist = await prisma.admin.findFirst({
      where: {
        id,
        isDeleted: false,
      },
    });

    if (!isAdminExist) {
      throw new AppError(status.NOT_FOUND, "Admin Or Super Admin not found");
    }

    const { admin } = payload;

    const updatedAdmin = await prisma.admin.update({
      where: {
        id,
      },
      data: {
        ...admin,
      },
    });

    return updatedAdmin;
  },

  deleteAdmin: async (id: string, user: IRequestUser) => {
    const isAdminExist = await prisma.admin.findFirst({
      where: {
        id,
        isDeleted: false,
      },
    });

    if (!isAdminExist) {
      throw new AppError(status.NOT_FOUND, "Admin Or Super Admin not found");
    }

    if (isAdminExist.userId === user.userId) {
      throw new AppError(status.BAD_REQUEST, "You cannot delete yourself");
    }

    const result = await prisma.$transaction(async (tx) => {
      await tx.admin.update({
        where: { id },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
        },
      });

      await tx.user.update({
        where: { id: isAdminExist.userId },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
          status: UserStatus.DELETED,
        },
      });

      await tx.session.deleteMany({
        where: { userId: isAdminExist.userId },
      });

      await tx.account.deleteMany({
        where: { userId: isAdminExist.userId },
      });

      const admin = await tx.admin.findUnique({
        where: { id },
        include: {
          user: true,
        },
      });

      return admin;
    });

    return result;
  },
};
