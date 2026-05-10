import { Specialty } from "../../../generated/prisma/client";
import { SpecialtiesRepo } from "./specialties.repository";

export const SpecialtiesService = {
  createSpecialty: async function (payload: Specialty): Promise<Specialty> {
    return await SpecialtiesRepo.createSpecialty(payload);
  },
};
