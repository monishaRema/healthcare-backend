import { prisma } from "../../lib/prisma";

export const DoctorsService = {
  getAllDoctors: async () => {
    const doctors = await prisma.doctor.findMany({
      where: {
        isDeleted: false,
      },
      include: {
        user: true,
        specialties: {
          include: {
            specialty: true,
          },
        },
      },
    });

    return doctors;
  },

  getDoctorById: async (id: string) => {
    const doctor = await prisma.doctor.findFirst({
      where: {
        id,
      },
    });
    return doctor;
  },

  updateDoctor: async () => {},
  deleteDoctor: async () => {},
};
