import Stripe from "stripe";
import { PaymentStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";

const handleStripeWebhookEvent = async (event: Stripe.Event) => {
  const existingPayment = await prisma.payment.findFirst({
    where: { stripeEventId: event.id },
  });

  if (existingPayment) {
    console.log(`Event ${event.id} already processed. Skipping`);
    return { message: `Event ${event.id} already processed. Skipping` };
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const appointmentId = session.metadata?.appointmentId;

      if (!appointmentId) {
        console.error("Missing appointmentId in Stripe session metadata");
        return { message: "Missing appointmentId in Stripe session metadata" };
      }

      const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId },
        include: { payment: true },
      });

      if (!appointment || !appointment.payment) {
        console.error(`Appointment ${appointmentId} or its payment record was not found`);
        return { message: "Appointment or payment record not found" };
      }

      const paymentStatus = session.payment_status === "paid" ? PaymentStatus.PAID : PaymentStatus.UNPAID;

      await prisma.$transaction([
        prisma.appointment.update({
          where: { id: appointmentId },
          data: { paymentStatus },
        }),
        prisma.payment.update({
          where: { appointmentId },
          data: {
            status: paymentStatus,
            stripeEventId: event.id,
            paymentGatewayData: JSON.parse(JSON.stringify(session)),
          },
        }),
      ]);

      console.log(`Payment ${session.payment_status} for appointment ${appointmentId}`);
      break;
    }

    case "checkout.session.expired": {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log(`Checkout session ${session.id} expired for appointment ${session.metadata?.appointmentId}`);
      break;
    }

    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log(`Payment intent ${paymentIntent.id} failed`);
      break;
    }

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return { message: `Webhook event ${event.id} processed successfully` };
};

export const PaymentService = {
  handleStripeWebhookEvent,
};
