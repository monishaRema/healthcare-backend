import { Router } from "express";
import { specialtyRouter } from "../modules/specialties/specialties.routes";

export const router = Router();

// /api/v1/specialties
router.use("/specialties",specialtyRouter)


