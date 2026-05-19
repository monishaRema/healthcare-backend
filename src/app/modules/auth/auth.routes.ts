import { Router } from "express";
import { AuthController } from "./auth.controller";
import { UserRole } from "../../../generated/prisma/enums";
import { checkAuth } from "../../middleware/checkAuth";

export const AuthRouter = Router();

// /api/v1/auth

AuthRouter.post("/register", AuthController.registerPatient);
AuthRouter.post("/login", AuthController.loginUser);
AuthRouter.get("/me", checkAuth(UserRole.ADMIN, UserRole.DOCTOR, UserRole.PATIENT, UserRole.SUPER_ADMIN), AuthController.getMe)
AuthRouter.post("/refresh-token", AuthController.getNewToken)
AuthRouter.post("/change-password", checkAuth(UserRole.ADMIN, UserRole.DOCTOR, UserRole.PATIENT, UserRole.SUPER_ADMIN), AuthController.changePassword)
AuthRouter.post("/logout", checkAuth(UserRole.ADMIN, UserRole.DOCTOR, UserRole.PATIENT, UserRole.SUPER_ADMIN), AuthController.logoutUser)
// AuthRouter.post("/change-password/:id", checkAuth(UserRole.ADMIN, UserRole.DOCTOR, UserRole.PATIENT, UserRole.SUPER_ADMIN), AuthController.changePassword)
