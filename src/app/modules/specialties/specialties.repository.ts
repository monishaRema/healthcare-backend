import { Prisma, Specialty } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

export const specialtiesRepo = {
  createSpecialty: async function (
    payload: Prisma.SpecialtyCreateInput,
  ): Promise<Specialty> {
    return await prisma.specialty.create({
      data: payload,
    });
  },

  getSpecialtyByTitle: async function (title: string): Promise<Specialty | null> {
    return await prisma.specialty.findUnique({
      where: {
        title,
      },
    });
  },

    // Get All Specialties
    getSpecialties: async function ():Promise<Specialty[]> {
        return await prisma.specialty.findMany()
    },
  
  
   // Update Specialty
    updateSpecialty: async function (id:string, data: Prisma.SpecialtyUpdateInput): Promise<Specialty> {
        return await prisma.specialty.update({
            where:{
                id
            },
            data: data
        })
    },
  
  
   // Delete Specialty
    deleteSpecialty: async function (id:string) {
        return await prisma.specialty.delete({
            where: {
                id
            }
        })
    },
};
