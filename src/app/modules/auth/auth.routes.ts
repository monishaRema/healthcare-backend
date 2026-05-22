import { Router } from "express";
import { AuthController } from "./auth.controller";
import { UserRole } from "../../../generated/prisma/enums";
import { checkAuth } from "../../middleware/checkAuth";


export const AuthRouter = Router();

// /api/v1/auth

// Public Routes
AuthRouter.post("/register", AuthController.registerPatient);
AuthRouter.post("/login", AuthController.loginUser);

AuthRouter.get("/me", checkAuth(UserRole.ADMIN, UserRole.DOCTOR, UserRole.PATIENT, UserRole.SUPER_ADMIN), AuthController.getMe)
AuthRouter.post("/logout", checkAuth(UserRole.ADMIN, UserRole.DOCTOR, UserRole.PATIENT, UserRole.SUPER_ADMIN), AuthController.logoutUser)
AuthRouter.post("/verify-email", AuthController.verifyEmail)

// Token Management Routes
AuthRouter.post("/refresh-token", AuthController.getNewToken)

// Password Management Routes
AuthRouter.post("/change-password", checkAuth(UserRole.ADMIN, UserRole.DOCTOR, UserRole.PATIENT, UserRole.SUPER_ADMIN), AuthController.changePassword)
AuthRouter.post("/forgot-password", AuthController.forgetPassword)
AuthRouter.post("/reset-password", AuthController.resetPassword)

// Google OAuth Routes
AuthRouter.get("/login/google", AuthController.googleLogin);
AuthRouter.get("/google/success", AuthController.googleLoginSuccess);
AuthRouter.get("/oauth/error", AuthController.handleOAuthError);

