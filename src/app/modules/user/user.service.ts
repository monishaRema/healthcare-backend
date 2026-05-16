import status from "http-status";
import { Specialty, UserRole } from "../../../generated/prisma/client";
import AppError from "../../errorHelper/AppError";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { ICreateDoctorPayload } from "./user.types";
import { UserValidationType } from "./user.validate";
import { UserRepository } from "./user.repository";

export const UserService = {
  createDoctor: async (payload: ICreateDoctorPayload) => {
    const specialtyIds = [...new Set(payload.specialties)];

    const specialties: Specialty[] = await prisma.specialty.findMany({
      where: {
        id: {
          in: specialtyIds,
        },
        isDeleted: false,
      },
    });

    if (specialties.length !== specialtyIds.length) {
      const foundIds = new Set(specialties.map((specialty) => specialty.id));

      const missingIds = specialtyIds.filter((id) => !foundIds.has(id));

      throw new AppError(
        status.NOT_FOUND,
        `Specialty not found or deleted: ${missingIds.join(", ")}`,
      );
    }

    const userExists = await UserRepository.findUserByEmail(
      payload.doctor.email,
    );
    if (userExists) {
      throw new AppError(
        status.CONFLICT,
        `User with email ${payload.doctor.email} already exists`,
      );
    }

    const doctorExist = await UserRepository.findDoctorByRegistrationNumber(
      payload.doctor.registrationNumber,
    );

    if (doctorExist) {
      throw new AppError(
        status.CONFLICT,
        "Doctor profile already exists for this registration number",
      );
    }

    const userData = await auth.api.signUpEmail({
      body: {
        email: payload.doctor.email,
        password: payload.password,
        role: UserRole.DOCTOR,
        name: payload.doctor.name,
        needPasswordChange: true,
      },
    });

    if (!userData || !userData.user) {
      throw new AppError(status.INTERNAL_SERVER_ERROR, "Failed to create user");
    }

    try {
      const result = await prisma.$transaction(async (tx) => {
        const doctorData = await tx.doctor.create({
          data: {
            userId: userData.user.id,
            ...payload.doctor,
          },
        });

        const doctorSpecialtyData = specialties.map((specialty) => {
          return {
            doctorId: doctorData.id,
            specialtyId: specialty.id,
          };
        });

        await tx.doctorSpecialty.createMany({
          data: doctorSpecialtyData,
        });

        const doctor = await tx.doctor.findUnique({
          where: {
            id: doctorData.id,
          },
          select: {
            id: true,
            userId: true,
            name: true,
            email: true,
            profilePhoto: true,
            contactNumber: true,
            address: true,
            registrationNumber: true,
            experience: true,
            gender: true,
            appointmentFee: true,
            qualification: true,
            currentWorkingPlace: true,
            designation: true,
            createdAt: true,
            updatedAt: true,
            user: {
              select: {
                id: true,
                email: true,
                name: true,
                role: true,
                status: true,
                emailVerified: true,
                image: true,
                isDeleted: true,
                deletedAt: true,
                createdAt: true,
                updatedAt: true,
              },
            },
            specialties: {
              select: {
                specialty: {
                  select: {
                    title: true,
                    id: true,
                  },
                },
              },
            },
          },
        });

        return doctor;
      });

      return result;
    } catch (error) {
      console.log("Transaction error : ", error);
      await UserRepository.deleteUserById(userData.user.id);
      throw new AppError(
        status.INTERNAL_SERVER_ERROR,
        "Failed to create doctor profile",
      );
    }
  },

  createAdmin: async (
    payload: UserValidationType["createAdminValidationSchema"],
  ) => {
    const userExists = await UserRepository.findUserByEmail(
      payload.admin.email,
    );
    if (userExists) {
      throw new AppError(
        status.CONFLICT,
        `User with email ${payload.admin.email} already exists`,
      );
    }

    const { admin, password } = payload;

    const userData = await auth.api.signUpEmail({
      body: {
        ...admin,
        password,
        role: UserRole.ADMIN,
        needPasswordChange: true,
      },
    });

    if (!userData || !userData.user) {
      throw new AppError(status.INTERNAL_SERVER_ERROR, "Failed to create user");
    }

    try {
      const result = await prisma.$transaction(async (tx) => {
        // create admin profile
        const newAdmin = await UserRepository.createAdmin({
          userId: userData.user.id,
          ...admin,
        }, tx);

        // fetch the created admin profile with user data
        const adminData = await UserRepository.findAdminById(newAdmin.id, tx);

        return adminData;
      });

      return result;
    } catch (error) {
      console.log("Error creating admin profile : ", error);

      await UserRepository.deleteUserById(userData.user.id);
      throw new AppError(
        status.INTERNAL_SERVER_ERROR,
        "Failed to create admin profile",
      );
    }
  },
};
