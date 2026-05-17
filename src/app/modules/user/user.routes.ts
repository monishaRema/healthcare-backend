import { Router } from "express";
import { UserController } from "./user.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { userValidation } from "./user.validate";
import { checkAuth } from "../../middleware/checkAuth";
import { UserRole } from "../../../generated/prisma/enums";

export const userRouter = Router();

// api/v1/users/create-doctor => admin / super-admin
userRouter.post(
  "/create-doctor",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validateRequest(userValidation.createDoctorZodSchema),
  UserController.createDoctor,
);
userRouter.post(
  "/create-admin",
  checkAuth(UserRole.SUPER_ADMIN),
  validateRequest(userValidation.createAdminValidationSchema),
  UserController.createAdmin,
);

// userRouter.post("/create-super-admin",UserController.createSuperAdmin)
