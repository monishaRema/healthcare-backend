
import status from "http-status";
import AppError from "../../errorHelper/AppError";
import { DoctorsRepository } from "./doctor.repository";

export const DoctorsService = {
  getAllDoctors: async () => {
   const result = await DoctorsRepository.getAllDoctors();
    // Transform specialties (flatten structure)
  const doctors = result.map((doctor) => ({
    ...doctor,
    specialties: doctor.specialties.map((s) => s.specialty),
  }));

  return doctors;
  
  },

  getDoctorById: async (id: string) => {
    const doctor = await DoctorsRepository.getDoctorById(id);
    if(!doctor) {
      throw new AppError(status.NOT_FOUND, "Doctor not found");
    }

    return {
    ...doctor,
    specialties: doctor.specialties.map((s) => s.specialty),
  };
  },

  updateDoctor: async () => {},
  deleteDoctor: async () => {},
};
