import { Router } from "express";
import { DoctorsController } from "./doctor.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { updateDoctorValidationSchema } from "./doctors.validate";

export const doctorRouter = Router();

// api/v1/All doctor => 

doctorRouter.get("/",DoctorsController.getAllDoctors)
doctorRouter.get("/:id",DoctorsController.getDoctorById)
doctorRouter.patch(
  "/:id",
  validateRequest(updateDoctorValidationSchema),
  DoctorsController.updateDoctor,
)
doctorRouter.delete("/:id",DoctorsController.deleteDoctor)
