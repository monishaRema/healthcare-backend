import { Router } from "express";
import { AuthController } from "./auth.controller";

export const AuthRouter = Router();

// /api/v1/auth

AuthRouter.post("/register", AuthController.registerPatient);
AuthRouter.post("/login", AuthController.loginUser);
