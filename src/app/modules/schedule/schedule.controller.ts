import { Request, Response } from "express";
import status from "http-status";
import { IQueryParams } from "../../interfaces/query.interface";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { scheduleService } from "./schedule.service";

export const ScheduleController = {
  createSchedule: catchAsync(async (req: Request, res: Response) => {
    const result = await scheduleService.createSchedule(req.body);

    sendResponse({
      res,
      statusCode: status.CREATED,
      success: true,
      message: "Schedule created successfully",
      data: result,
    });
  }),

  getAllSchedules: catchAsync(async (req: Request, res: Response) => {
    const result = await scheduleService.getAllSchedules(req.query as IQueryParams);

    sendResponse({
      res,
      statusCode: status.OK,
      success: true,
      message: "Schedules retrieved successfully",
      data: result.data,
      meta: result.meta,
    });
  }),

  getScheduleById: catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await scheduleService.getScheduleById(id as string);

    sendResponse({
      res,
      statusCode: status.OK,
      success: true,
      message: "Schedule retrieved successfully",
      data: result,
    });
  }),

  updateSchedule: catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await scheduleService.updateSchedule(id as string, req.body);

    sendResponse({
      res,
      statusCode: status.OK,
      success: true,
      message: "Schedule updated successfully",
      data: result,
    });
  }),

  deleteSchedule: catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    await scheduleService.deleteSchedule(id as string);

    sendResponse({
      res,
      statusCode: status.OK,
      success: true,
      message: "Schedule deleted successfully",
    });
  }),
};

