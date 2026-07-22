import { Request, Response } from "express";
import status from "http-status";
import AppError from "../../errorHelper/AppError";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { AppointmentService } from "./appointment.service";

export const AppointmentController = {
  bookAppointment: catchAsync(async (req: Request, res: Response) => {
    const payload = req.body;
    const user = req.user;

    if (!user) {
      throw new AppError(status.UNAUTHORIZED, "Unauthorized access");
    }

    const appointment = await AppointmentService.bookAppointment(payload, user);

    sendResponse({
      res,
      statusCode: status.CREATED,
      success: true,
      message: "Appointment booked successfully",
      data: appointment,
    });
  }),

  getMyAppointments: catchAsync(async (req: Request, res: Response) => {
    const user = req.user;

    if (!user) {
      throw new AppError(status.UNAUTHORIZED, "Unauthorized access");
    }

    const appointments = await AppointmentService.getMyAppointments(user);

    sendResponse({
      res,
      statusCode: status.OK,
      success: true,
      message: "Appointments retrieved successfully",
      data: appointments,
    });
  }),

  changeAppointmentStatus: catchAsync(async (req: Request, res: Response) => {
    const appointmentId = req.params.id;
    const payload = req.body;
    const user = req.user;

    if (!user) {
      throw new AppError(status.UNAUTHORIZED, "Unauthorized access");
    }

    const updatedAppointment = await AppointmentService.changeAppointmentStatus(appointmentId as string, payload, user);

    sendResponse({
      res,
      statusCode: status.OK,
      success: true,
      message: "Appointment status updated successfully",
      data: updatedAppointment,
    });
  }),

  getMySingleAppointment: catchAsync(async (req: Request, res: Response) => {
    const appointmentId = req.params.id;
    const user = req.user;

    if (!user) {
      throw new AppError(status.UNAUTHORIZED, "Unauthorized access");
    }

    const appointment = await AppointmentService.getMySingleAppointment(appointmentId as string, user);

    sendResponse({
      res,
      statusCode: status.OK,
      success: true,
      message: "Appointment retrieved successfully",
      data: appointment,
    });
  }),

  getAllAppointments: catchAsync(async (req: Request, res: Response) => {
    const appointments = await AppointmentService.getAllAppointments();

    sendResponse({
      res,
      statusCode: status.OK,
      success: true,
      message: "All appointments retrieved successfully",
      data: appointments,
    });
  }),

  bookAppointmentWithPayLater: catchAsync(async (req: Request, res: Response) => {
    const payload = req.body;
    const user = req.user;

    if (!user) {
      throw new AppError(status.UNAUTHORIZED, "Unauthorized access");
    }

    const appointment = await AppointmentService.bookAppointmentWithPayLater(payload, user);

    sendResponse({
      res,
      statusCode: status.CREATED,
      success: true,
      message: "Appointment booked successfully with Pay Later option",
      data: appointment,
    });
  }),

  initiatePayment: catchAsync(async (req: Request, res: Response) => {
    const appointmentId = req.params.id;
    const user = req.user;

    if (!user) {
      throw new AppError(status.UNAUTHORIZED, "Unauthorized access");
    }

    const paymentInfo = await AppointmentService.initiatePayment(appointmentId as string, user);

    sendResponse({
      res,
      statusCode: status.OK,
      success: true,
      message: "Payment initiated successfully",
      data: paymentInfo,
    });
  }),
};
