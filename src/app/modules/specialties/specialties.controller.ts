import { Request, Response } from "express";
import { specialtiesService } from "./specialties.service";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";

export const specialtiesController = {
  // Create Specialty
  createSpecialty: catchAsync(async (req: Request, res: Response) => {
    const specialty = await specialtiesService.createSpecialty(req.body);

    sendResponse({
      res,
      statusCode: 201,
      success: true,
      message: "Specialties created successfully",
      data: specialty,
    });
  }),

  // Get All Specialties
  getSpecialties: catchAsync(async (req: Request, res: Response) => {
    const result = await specialtiesService.getSpecialties();

    sendResponse({
      res,
      statusCode: 200,
      success: true,
      message: "Specialties fetched successfully",
      data: result,
    });
  }),

  // Update Specialty
  updateSpecialty: catchAsync(async (req: Request, res: Response) => {
    const result = await specialtiesService.updateSpecialty(
      req.params.id as string,
      req.body,
    );
    sendResponse({
      res,
      statusCode: 200,
      success: true,
      message: "Specialty fetched successfully",
      data: result,
    });
  }),

  // Delete Specialty
  deleteSpecialty: catchAsync(async (req: Request, res: Response) => {
    const result = await specialtiesService.deleteSpecialty(
      req.params.id as string,
    );
    sendResponse({
      res,
      statusCode: 200,
      success: true,
      message: "Specialty deleted successfully",
      data: result,
    });
  }),
};
