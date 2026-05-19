import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { UserRole } from "../../../generated/prisma/enums";
import { AdminController } from "./admin.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { updateAdminZodSchema } from "./admin.validation";


export const AdminRoutes  = Router();

AdminRoutes.get("/",
    checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
    AdminController.getAllAdmins);
AdminRoutes.get("/:id",
    checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
    AdminController.getAdminById);
AdminRoutes.patch("/:id",
    checkAuth(UserRole.SUPER_ADMIN),
    validateRequest(updateAdminZodSchema), AdminController.updateAdmin);
AdminRoutes.delete("/:id",
    checkAuth(UserRole.SUPER_ADMIN),
    AdminController.deleteAdmin);

