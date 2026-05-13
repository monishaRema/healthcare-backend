import { Router } from "express";
import { UserController } from "./user.controller";

export const userRouter = Router();

// api/v1/users/create-doctor => admin / super-admin
userRouter.post("/create-doctor",UserController.createUser)

// userRouter.post("/create-admin",UserController.createUser)
// userRouter.post("/create-super-admin",UserController.createUser)