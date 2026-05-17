import { Router } from "express";
import { specialtiesController } from "./specialties.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { UserRole } from "../../../generated/prisma/enums";
import { validateRequest } from "../../middleware/validateRequest";
import { SpecialtyValidation } from "./specialties.validation";

export const specialtyRouter = Router();

// Base =>  /api/v1/specialties

specialtyRouter.get("/", specialtiesController.getSpecialties);

specialtyRouter.post(
  "/",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validateRequest(SpecialtyValidation.createSpecialtyZodSchema),
  specialtiesController.createSpecialty,
);

specialtyRouter.patch(
  "/:id",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  specialtiesController.updateSpecialty,
);

specialtyRouter.delete(
  "/:id",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  specialtiesController.deleteSpecialty,
);
