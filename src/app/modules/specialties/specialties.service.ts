import { Prisma, Specialty } from "../../../generated/prisma/client";
import status from "http-status";
import { specialtiesRepo } from "./specialties.repository";
import AppError from "../../errorHelper/AppError";

export const specialtiesService = {

  // Create Specialty

  createSpecialty: async function (
    payload: Prisma.SpecialtyCreateInput,
  ): Promise<Specialty> {
    const existingSpecialty = await specialtiesRepo.getSpecialtyByTitle(payload.title);

    if (existingSpecialty) {
    throw new AppError(
      status.CONFLICT,
      `Specialty with title ${payload.title} already exists`,
    );
    }

    return await specialtiesRepo.createSpecialty(payload);
  },

    // Get All Specialties
    getSpecialties: async function () {
        return await specialtiesRepo.getSpecialties();
    },
  
  
   // Update Specialty
    updateSpecialty: async function (id:string, data:Prisma.SpecialtyUpdateInput) {
        const updatedTitle =
          typeof data.title === "string"
            ? data.title
            : typeof data.title?.set === "string"
              ? data.title.set
              : undefined;

        if (updatedTitle) {
          const existingSpecialty =
            await specialtiesRepo.getSpecialtyByTitle(updatedTitle);

          if (existingSpecialty && existingSpecialty.id !== id) {
            throw new AppError(
              status.CONFLICT,
              `Specialty with title ${updatedTitle} already exists`
            );
          }
        }

        return await specialtiesRepo.updateSpecialty(id, data)
    },
  
  
   // Delete Specialty
    deleteSpecialty: async function (id: string) {
        return await specialtiesRepo.deleteSpecialty(id)
    },
};
