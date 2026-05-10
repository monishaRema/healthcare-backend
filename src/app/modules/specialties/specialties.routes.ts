import { Router } from "express";
import { specialtiesController } from "./specialties.controller";

export const specialtyRouter = Router();

// Base =>  /api/v1/specialties


specialtyRouter.get("/",specialtiesController.getSpecialties)
specialtyRouter.post("/",specialtiesController.createSpecialty)
specialtyRouter.patch("/:id",specialtiesController.updateSpecialty)
specialtyRouter.delete("/:id",specialtiesController.deleteSpecialty)