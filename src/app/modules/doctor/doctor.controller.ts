import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { DoctorsService } from "./doctor.service";
import status from "http-status";

export const DoctorsController = {
  getAllDoctors: catchAsync(async (req: Request, res: Response) => {
    const result = await DoctorsService.getAllDoctors();

    sendResponse({
      res,
      statusCode: status.OK,
      success: true,
      message: "Doctors fetched successfully",
      data: result,
    });
  }),

  getDoctorById: catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const doctor = await DoctorsService.getDoctorById(id as string);

    sendResponse({
      res,
      statusCode: status.OK,
      success: true,
      message: "Doctors fetched successfully",
      data: doctor,
    });
  }),
  updateDoctor: catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const updateData = req.body;

    const result = await DoctorsService.updateDoctor(id as string, updateData);

    sendResponse({
      res,
      statusCode: status.OK,
      success: true,
      message: "Doctor updated successfully",
      data: result,
    });
  }),
  deleteDoctor: catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    await DoctorsService.deleteDoctor(id as string);

    sendResponse({
      res,
      statusCode: status.OK,
      success: true,
      message: "Doctor deleted successfully",
    });
  }),
};
