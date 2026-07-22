import status from "http-status";
import { randomUUID } from "crypto";
import { PaymentStatus } from "../../../generated/prisma/enums";
import AppError from "../../errorHelper/AppError";
import { IRequestUser } from "../../interfaces/reqUser.interface";
import { env } from "../../config/env";
import { prisma } from "../../lib/prisma";
import { stripe } from "../../config/stripe.config";
import { IBookAppointmentPayload } from "./appointment.interface";

export const AppointmentService = {
  bookAppointment: async (payload: IBookAppointmentPayload, user: IRequestUser) => {
    const paitentData = await prisma.patient.findUnique({
      where: {
        email: user.email
      }
    })

    const docotorData = await prisma.doctor.findUnique({
      where: {
        id: payload.doctorId,
        isDeleted: false
      }
    })
  },

  getMyAppointments: async (user: IRequestUser) => {},

  changeAppointmentStatus: async (appointmentId: string, payload: any, user: IRequestUser) => {},

  getMySingleAppointment: async (appointmentId: string, user: IRequestUser) => {},

  getAllAppointments: async () => {},

  bookAppointmentWithPayLater: async (payload: any, user: IRequestUser) => {},

  initiatePayment: async (appointmentId: string, user: IRequestUser) => {
    const patient = await prisma.patient.findUnique({
      where: { email: user.email }
    });

    if (!patient) {
      throw new AppError(status.NOT_FOUND, "Patient not found");
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { doctor: true },
    });

    if (!appointment) {
      throw new AppError(status.NOT_FOUND, "Appointment not found");
    }

    if (appointment.patientId !== patient.id) {
      throw new AppError(status.FORBIDDEN, "Forbidden access! This is not your appointment");
    }

    if (appointment.paymentStatus === PaymentStatus.PAID) {
      throw new AppError(status.BAD_REQUEST, "This appointment is already paid");
    }

    const transactionId = randomUUID();

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: Math.round(appointment.doctor.appointmentFee * 100),
            product_data: {
              name: `Appointment with Dr. ${appointment.doctor.name}`,
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${env.FRONTEND_URL}/payment/success?appointmentId=${appointment.id}`,
      cancel_url: `${env.FRONTEND_URL}/payment/cancel?appointmentId=${appointment.id}`,
      metadata: {
        appointmentId: appointment.id,
        transactionId,
      },
    });

    await prisma.payment.upsert({
      where: { appointmentId: appointment.id },
      update: { transactionId, amount: appointment.doctor.appointmentFee },
      create: {
        appointmentId: appointment.id,
        amount: appointment.doctor.appointmentFee,
        transactionId,
      },
    });

    return { checkoutUrl: session.url, sessionId: session.id };
  },
};
