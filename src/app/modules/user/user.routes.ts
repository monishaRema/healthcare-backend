import { Router } from "express";
import { UserController } from "./user.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { createDoctorZodSchema } from "./user.validate";

export const userRouter = Router();

// api/v1/users/create-doctor => admin / super-admin
userRouter.post("/create-doctor",validateRequest(createDoctorZodSchema),UserController.createUser)

// userRouter.post("/create-admin",UserController.createUser)
// userRouter.post("/create-super-admin",UserController.createUser)