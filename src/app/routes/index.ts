import { Router } from "express";
import { specialtyRouter } from "../modules/specialties/specialties.routes";
import { AuthRouter } from "../modules/auth/auth.routes";
import { userRouter } from "../modules/user/user.routes";

export const router = Router();


// api/auth => better auth


// /api/v1/specialties
router.use("/specialties",specialtyRouter)

// /api/v1/auth
router.use("/auth",AuthRouter)

// /api/v1/doctors
router.use("/users",userRouter)


