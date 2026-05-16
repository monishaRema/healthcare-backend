import { Router } from "express";
import { UserController } from "./user.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { userValidation } from "./user.validate";

export const userRouter = Router();

// api/v1/users/create-doctor => admin / super-admin
userRouter.post(
  "/create-doctor",
  validateRequest(userValidation.createDoctorZodSchema),
  UserController.createDoctor,
);
userRouter.post(
  "/create-admin",
  validateRequest(userValidation.createAdminValidationSchema),
  UserController.createAdmin,
);

// userRouter.post("/create-super-admin",UserController.createSuperAdmin)
