import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { UserService } from "./user.service";
import status from "http-status";

export const UserController = {
  createUser: catchAsync(async (req: Request, res: Response) => {
    const result = await UserService.createUser(req.body);

    sendResponse({
      res,
      statusCode: status.CREATED,
      success: true,
      message: "User created successfully",
      data: result,
    });
  }),
};
