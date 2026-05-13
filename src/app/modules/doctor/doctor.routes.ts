import { Router } from "express";
import { DoctorsController } from "./doctor.controller";

export const doctorRouter = Router();

// api/v1/All doctor => 

doctorRouter.get("/",DoctorsController.getAllDoctors)
doctorRouter.get("/:id",DoctorsController.getDoctorById)