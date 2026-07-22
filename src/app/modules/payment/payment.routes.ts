import { Router } from "express";

export const paymentRoutes = Router();

// Stripe webhook is handled directly in app.ts (POST /webhook), since it
// needs the raw request body and must run before express.json().
