import { Router } from "express";
import { SpecialtiesController } from "./specialties.controller";

export const specialtyRouter = Router();

// Base =>  /api/v1/specialties


specialtyRouter.post("/",SpecialtiesController.createSpecialty)