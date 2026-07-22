import { Request, Response } from "express";
import status from "http-status";
import Stripe from "stripe";
import AppError from "../../errorHelper/AppError";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { env } from "../../config/env";
import { stripe } from "../../config/stripe.config";
import { PaymentService } from "./payment.service";

export const PaymentController = {
  handleStripeWebhookEvent: catchAsync(async (req: Request, res: Response) => {
    const signature = req.headers["stripe-signature"];

    if (!signature) {
      throw new AppError(status.BAD_REQUEST, "Missing stripe-signature header");
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(req.body, signature, env.STRIPE.WEBHOOK_SECRET);
    } catch (err) {
      throw new AppError(status.BAD_REQUEST, `Webhook signature verification failed: ${(err as Error).message}`);
    }

    const result = await PaymentService.handleStripeWebhookEvent(event);

    sendResponse({
      res,
      statusCode: status.OK,
      success: true,
      message: "Webhook processed successfully",
      data: result,
    });
  }),
};
