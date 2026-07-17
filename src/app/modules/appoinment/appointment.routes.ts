import { Router } from "express";
import { UserRole } from "../../../generated/prisma/enums";
import { checkAuth } from "../../middleware/checkAuth";


export const appointmentRoutes = Router();

appointmentRoutes.post("/book-appointment", checkAuth(UserRole.PATIENT), AppointmentController.bookAppointment);
appointmentRoutes.get("/my-appointments", checkAuth(UserRole.PATIENT, UserRole.DOCTOR), AppointmentController.getMyAppointments);
appointmentRoutes.patch("/change-appointment-status/:id", checkAuth(UserRole.PATIENT, UserRole.DOCTOR, UserRole.ADMIN, UserRole.SUPER_ADMIN),AppointmentController.changeAppointmentStatus);
appointmentRoutes.get("/my-single-appointment/:id", checkAuth(UserRole.PATIENT, UserRole.DOCTOR), AppointmentController.getMySingleAppointment);
appointmentRoutes.get("/all-appointments", checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN), AppointmentController.getAllAppointments);
appointmentRoutes.post("/book-appointment-with-pay-later", checkAuth(UserRole.PATIENT), AppointmentController.bookAppointmentWithPayLater);
appointmentRoutes.post("/initiate-payment/:id", checkAuth(UserRole.PATIENT), AppointmentController.initiatePayment);

