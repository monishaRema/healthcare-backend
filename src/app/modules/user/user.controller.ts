import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { UserService } from "./user.service";
import status from "http-status";

export const UserController = {
  createDoctor: catchAsync(async (req: Request, res: Response) => {
    const result = await UserService.createDoctor(req.body);

    sendResponse({
      res,
      statusCode: status.CREATED,
      success: true,
      message: "Doctor created successfully",
      data: result,
    });
  }),

  createAdmin: catchAsync(async (req: Request, res: Response) => {
    const result = await UserService.createAdmin(req.body);
    sendResponse({
      res,
      statusCode: status.CREATED,
      success: true,
      message: "Admin created successfully",
      data: result,
    });
  }),

};