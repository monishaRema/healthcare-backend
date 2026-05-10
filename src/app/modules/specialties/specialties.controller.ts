import { Request,Response } from "express";
import { specialtiesService } from "./specialties.service";
import { catchAsync } from "../../shared/catchAsync";

export const specialtiesController = {
  // Create Specialty
  createSpecialty: catchAsync(async (req: Request, res: Response) => {
    const specialty = await specialtiesService.createSpecialty(req.body);

    return res.status(201).json({
      success: true,
      message: "Specialty created successfully",
      data: specialty,
    });
  }),

  // Get All Specialties
  getSpecialties: catchAsync(async (req:Request, res:Response) => {

    const result = await specialtiesService.getSpecialties();

    res.status(200).json({
        success:true, 
        message: "Specialties fetched successfully",
        data: result
    })

  }),

  // Update Specialty
  updateSpecialty: catchAsync(async  (req: Request, res: Response) => {
  
      const result = await specialtiesService.updateSpecialty(
        req.params.id as string,
        req.body,
      );
      res.status(200).json({
        success: true,
        message: "Specialty updated successfully",
        data: result,
      });
    
  }),

  // Delete Specialty
  deleteSpecialty: catchAsync(async(req: Request, res: Response) => {

    
      const result = await specialtiesService.deleteSpecialty(
        req.params.id as string,
      );
      res.status(200).json({
        success: true,
        message: "Specialty deleted successfully",
        data: result,
      });

  })
    
};


