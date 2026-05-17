import { prisma } from "../../lib/prisma";

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
    include: {
      specialties: {
        include: {
          specialty:{
            select: {
              id: true,
              title: true,
            },
          }
        },
      },
    },
  });
  },

  updateDoctor: async () => {},
  deleteDoctor: async () => {},
};
