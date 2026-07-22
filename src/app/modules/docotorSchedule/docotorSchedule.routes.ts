import { Router } from "express";

import { checkAuth } from "../../middleware/checkAuth";

import { UserRole } from "../../../generated/prisma/enums";
import { DoctorScheduleController } from "./docotorSchedule.controller";

export const doctorScheduleRoutes = Router();

doctorScheduleRoutes.post("/create-my-doctor-schedule",
    checkAuth(UserRole.DOCTOR),
     DoctorScheduleController.createMyDoctorSchedule);
doctorScheduleRoutes.get("/my-doctor-schedules", checkAuth(UserRole.DOCTOR), DoctorScheduleController.getMyDoctorSchedules);
doctorScheduleRoutes.get("/", checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN), DoctorScheduleController.getAllDoctorSchedules);
doctorScheduleRoutes.get("/:doctorId/schedule/:scheduleId", checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN), DoctorScheduleController.getDoctorScheduleById);
doctorScheduleRoutes.patch("/update-my-doctor-schedule",
    checkAuth(UserRole.DOCTOR),
    DoctorScheduleController.updateMyDoctorSchedule);
doctorScheduleRoutes.delete("/delete-my-doctor-schedule/:id", checkAuth(UserRole.DOCTOR), DoctorScheduleController.deleteMyDoctorSchedule);

