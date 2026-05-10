import { Request, Response } from "express";
import { SpecialtiesService } from "./specialties.service";

export const SpecialtiesController = {
  createSpecialty: async function (req: Request, res: Response) {
    const specialty = await SpecialtiesService.createSpecialty(req.body);

    return res.status(201).json({
      success: true,
      message: "Specialty created successfully",
      data: specialty,
    });
  },
};
