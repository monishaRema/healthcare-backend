import { Router } from "express";
import { UserRole } from "../../../generated/prisma/enums";
import { checkAuth } from "../../middleware/checkAuth";
import { ScheduleController } from "./schedule.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { ScheduleValidation } from "./schedule.validation";

const router = Router();

router.post('/', checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN), validateRequest(ScheduleValidation.createScheduleZodSchema) , ScheduleController.createSchedule);
router.get('/', checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.DOCTOR), ScheduleController.getAllSchedules);
router.get('/:id', checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.DOCTOR), ScheduleController.getScheduleById);
router.patch('/:id', checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),validateRequest(ScheduleValidation.updateScheduleZodSchema), ScheduleController.updateSchedule);
router.delete('/:id', checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN), ScheduleController.deleteSchedule);

export const scheduleRoutes = router;