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

    const doctor = await DoctorsService.getDoctorById(id);

    sendResponse({
      res,
      statusCode: status.OK,
      success: true,
      message: "Doctors fetched successfully",
      data: doctor,
    });
  }),
  updateDoctor: async () => {},
  deleteDoctor: async () => {},
};
