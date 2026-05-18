import status from "http-status";
import AppError from "../../errorHelper/AppError";
import { DoctorsRepository } from "./doctor.repository";
import {
  UpdateDoctorValidationSchemaType,
} from "./doctors.validate";

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
    if (!doctor) {
      throw new AppError(status.NOT_FOUND, "Doctor not found");
    }

    return {
      ...doctor,
      specialties: doctor.specialties.map((s) => s.specialty),
    };
  },

  updateDoctor: async (id: string, payload: UpdateDoctorValidationSchemaType) => {
    
    const existingDoctor = await DoctorsRepository.getDoctorById(id);

    if (!existingDoctor) {
      throw new AppError(status.NOT_FOUND, "Doctor not found");
    }

    const { specialties, ...doctorData } = payload;
    const specialtyIds =
      specialties !== undefined ? [...new Set(specialties)] : undefined;

    if (specialtyIds !== undefined) {
      const specialtiesInDb =
        await DoctorsRepository.getSpecialtiesByIds(specialtyIds);

      if (specialtiesInDb.length !== specialtyIds.length) {
        const foundIds = new Set(
          specialtiesInDb.map((specialty) => specialty.id),
        );
        const missingIds = specialtyIds.filter((item) => !foundIds.has(item));

        throw new AppError(
          status.NOT_FOUND,
          `Specialty not found or deleted: ${missingIds.join(", ")}`,
        );
      }
    }

    const updatedDoctor = await DoctorsRepository.updateDoctor(
      id,
      doctorData,
      specialtyIds,
    );

    if (!updatedDoctor) {
      throw new AppError(status.NOT_FOUND, "Doctor not found");
    }

    return {
      ...updatedDoctor,
      specialties: updatedDoctor.specialties.map((item) => item.specialty),
    };
  },
  deleteDoctor: async (id: string) => {
    const deletedDoctor = await DoctorsRepository.getDoctorByIdWithDeleted(id);
    if (!deletedDoctor) {
      throw new AppError(status.NOT_FOUND, "Doctor not found");
    }

    if (deletedDoctor.isDeleted) {
      throw new AppError(status.BAD_REQUEST, "Doctor is already deleted");
    }
    return await DoctorsRepository.deleteDoctor(id);
   
  }
};
