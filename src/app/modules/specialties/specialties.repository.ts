import { Specialty } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

export const SpecialtiesRepo = {
  createSpecialty: async function (payload: Specialty): Promise<Specialty> {
    return await prisma.specialty.create({
      data: payload,
    });
  },
};
