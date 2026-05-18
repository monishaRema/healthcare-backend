import { Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

const doctorWithSpecialtiesInclude = {
  specialties: {
    include: {
      specialty: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  },
} satisfies Prisma.DoctorInclude;

export const DoctorsRepository = {
  getAllDoctors: async () => {
    const result = await prisma.doctor.findMany({
      where: {
        isDeleted: false,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        name: true,
        email: true,
        profilePhoto: true,
        contactNumber: true,
        registrationNumber: true,
        experience: true,
        gender: true,
        appointmentFee: true,
        qualification: true,
        currentWorkingPlace: true,
        designation: true,
        averageRating: true,
        createdAt: true,
        updatedAt: true,
        specialties: {
          select: {
            specialty: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
    });

    return result;
  },

  getDoctorById: async (id: string) => {
    return await prisma.doctor.findUnique({
      where: {
        id,
        isDeleted: false,
      },
      include: doctorWithSpecialtiesInclude,
    });
  },

  getSpecialtiesByIds: async (specialtyIds: string[]) => {
    return await prisma.specialty.findMany({
      where: {
        id: {
          in: specialtyIds,
        },
        isDeleted: false,
      },
    });
  },

  updateDoctor: async (
    id: string,
    doctorData: Prisma.DoctorUpdateInput,
    specialtyIds?: string[],
  ) => {
    return await prisma.$transaction(async (tx) => {
      if (Object.keys(doctorData).length > 0) {
        await tx.doctor.update({
          where: { id },
          data: doctorData,
        });
      }

      if (specialtyIds !== undefined) {
        await tx.doctorSpecialty.deleteMany({
          where: { doctorId: id },
        });

        if (specialtyIds.length > 0) {
          await tx.doctorSpecialty.createMany({
            data: specialtyIds.map((specialtyId) => ({
              doctorId: id,
              specialtyId,
            })),
          });
        }
      }

      return await tx.doctor.findUnique({
        where: { id },
        include: doctorWithSpecialtiesInclude,
      });
    });
  },

  getDoctorByIdWithDeleted: async (id: string) => {
    return await prisma.doctor.findUnique({
      where: {
        id,
      },
      include: doctorWithSpecialtiesInclude,
    });
  },
  deleteDoctor: async (id: string) => {
    return await prisma.doctor.update({
      where: {
        id,
      },
      data: {
        isDeleted: true,
      },
    });
  },
};
