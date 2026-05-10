import { Prisma, Specialty } from "../../../generated/prisma/client";
import { specialtiesRepo } from "./specialties.repository";

export const specialtiesService = {

  // Create Specialty

  createSpecialty: async function (payload: Specialty): Promise<Specialty> {
    return await specialtiesRepo.createSpecialty(payload);
  },

    // Get All Specialties
    getSpecialties: async function () {
        return await specialtiesRepo.getSpecialties();
    },
  
  
   // Update Specialty
    updateSpecialty: async function (id:string, data:Prisma.SpecialtyUpdateInput) {
        return await specialtiesRepo.updateSpecialty(id, data)
    },
  
  
   // Delete Specialty
    deleteSpecialty: async function (id: string) {
        return await specialtiesRepo.deleteSpecialty(id)
    },
};
