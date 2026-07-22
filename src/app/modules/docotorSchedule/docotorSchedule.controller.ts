import { Request, Response } from "express";
import status from "http-status";
import AppError from "../../errorHelper/AppError";
import { IQueryParams } from "../../interfaces/query.interface";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { doctorScheduleService } from "./docotorSchedule.service";


export const DoctorScheduleController = {
  createMyDoctorSchedule: catchAsync(async (req: Request, res: Response) => {
     const payload = req.body;
    const user = req.user;

    if (!user) {
      throw new AppError(status.UNAUTHORIZED, "Unauthorized access");
    }

    const doctorSchedule = await doctorScheduleService.createMyDoctorSchedule(user, payload);

    sendResponse({
      res,
      statusCode: status.CREATED,
      success: true,
      message: "Doctor schedule created successfully",
      data: doctorSchedule,
    });
  }),

  getMyDoctorSchedules: catchAsync(async (req: Request, res: Response) => {
    const user = req.user;
    const query = req.query as IQueryParams;

    if (!user) {
      throw new AppError(status.UNAUTHORIZED, "Unauthorized access");
    }

    const result = await doctorScheduleService.getMyDoctorSchedules(user, query);

    sendResponse({
      res,
      statusCode: status.OK,
      success: true,
      message: "Doctor schedules retrieved successfully",
      data: result.data,
      meta: result.meta,
    });
  }),

  getAllDoctorSchedules: catchAsync(async (req: Request, res: Response) => {
    const result = await doctorScheduleService.getAllDoctorSchedules(req.query as IQueryParams);

    sendResponse({
      res,
      statusCode: status.OK,
      success: true,
      message: "All doctor schedules retrieved successfully",
      data: result.data,
      meta: result.meta,
    });
  }),

  getDoctorScheduleById: catchAsync(async (req: Request, res: Response) => {
    const { doctorId, scheduleId } = req.params;

    const result = await doctorScheduleService.getDoctorScheduleById(doctorId as string, scheduleId as string);

    sendResponse({
      res,
      statusCode: status.OK,
      success: true,
      message: "Doctor schedule retrieved successfully",
      data: result,
    });
  }),

  updateMyDoctorSchedule: catchAsync(async (req: Request, res: Response) => {
    const user = req.user;

    if (!user) {
      throw new AppError(status.UNAUTHORIZED, "Unauthorized access");
    }

    const result = await doctorScheduleService.updateMyDoctorSchedule(user, req.body);

    sendResponse({
      res,
      statusCode: status.OK,
      success: true,
      message: "Doctor schedule updated successfully",
      data: result,
    });
  }),

  deleteMyDoctorSchedule: catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = req.user;

    if (!user) {
      throw new AppError(status.UNAUTHORIZED, "Unauthorized access");
    }

    await doctorScheduleService.deleteMyDoctorSchedule(id as string, user);

    sendResponse({
      res,
      statusCode: status.OK,
      success: true,
      message: "Doctor schedule deleted successfully",
    });
  }),
};
