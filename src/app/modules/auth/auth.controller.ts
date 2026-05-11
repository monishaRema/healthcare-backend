import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { AuthService } from "./auth.service";
import { sendResponse } from "../../shared/sendResponse";

export const AuthController = {

    registerPatient :catchAsync(async (req:Request,res:Response) => {

        const result = await AuthService.registerPatient(req.body)

        sendResponse({
            res,
            statusCode:201,
            success:true,
            message:"User Created Successfully",
            data:result
        })
    }),
    loginUser :catchAsync(async (req:Request,res:Response) => {

        const result = await AuthService.loginUser(req.body)

        sendResponse({
            res,
            statusCode:200,
            success:true,
            message:"User Logged in Successfully",
            data:result
        })
    })
}