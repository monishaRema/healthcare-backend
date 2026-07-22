import { Router } from "express";
import { specialtyRouter } from "../modules/specialties/specialties.routes";
import { AuthRouter } from "../modules/auth/auth.routes";
import { userRouter } from "../modules/user/user.routes";
import { doctorRouter } from "../modules/doctor/doctor.routes";
import { AdminRoutes } from "../modules/admin/admin.routes";
import { scheduleRoutes } from "../modules/schedule/schedule.routes";
import { doctorScheduleRoutes } from "../modules/docotorSchedule/docotorSchedule.routes";
import { appointmentRoutes } from "../modules/appoinment/appointment.routes";
import { paymentRoutes } from "../modules/payment/payment.routes";

export const router = Router();


// api/auth => better auth


// /api/v1/specialties
router.use("/specialties",specialtyRouter)

// /api/v1/auth
router.use("/auth",AuthRouter)

// /api/v1/users
router.use("/users",userRouter)

// /api/v1/
router.use("/doctors",doctorRouter)
// /api/v1/admin
router.use("/admin",AdminRoutes)

// /api/v1/schedules
router.use("/schedules", scheduleRoutes)

// /api/v1/doctor-schedules
router.use("/doctor-schedules", doctorScheduleRoutes)

// /api/v1/appointments
router.use("/appointments", appointmentRoutes)

// /api/v1/payments
router.use("/payments", paymentRoutes)




