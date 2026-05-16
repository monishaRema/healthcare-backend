/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import { UserRole, UserStatus } from "../../generated/prisma/enums";
import { CookieUtils } from "../utils/cookie";
import AppError from "../errorHelper/AppError";
import status from "http-status";
import { jwtUtils } from "../utils/jwt";
import { env } from "../config/env";
import { prisma } from "../lib/prisma";


export function checkAuth(...roles: UserRole[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const sessionToken = CookieUtils.getCookie(
        req,
        "better-auth.session_token",
      );

      // verify better-auth session token
      if (sessionToken) {
        const verifiedSession = await prisma.session.findFirst({
          where: {
            token: sessionToken,
            expiresAt: {
              gt: new Date(),
            },
          },
          include: {
            user: true,
          },
        });
        if (!verifiedSession) {
          throw new AppError(
            status.UNAUTHORIZED,
            "Unauthorized: Invalid session token",
          );
        }
        if (verifiedSession && verifiedSession.user) {
          const user = verifiedSession.user;
          const now = new Date();
          const expiresAt = new Date(verifiedSession.expiresAt);
          const createdAt = new Date(verifiedSession.createdAt);

          const sessionLifeTime = expiresAt.getTime() - createdAt.getTime();
          const timeRemaining = expiresAt.getTime() - now.getTime();

          const percentRemaining = (timeRemaining / sessionLifeTime) * 100;

          if (percentRemaining < 20) {
            res.setHeader("X-Session-Refresh", "true");
            res.setHeader("X-Session-Expires-At", expiresAt.toISOString());
            res.setHeader("X-Time-Remaining", timeRemaining.toString());

            console.log(
              `Session refresh needed. Time remaining: ${timeRemaining} ms`,
            );
          }

          if (
            user.status === UserStatus.BLOCKED ||
            user.status === UserStatus.DELETED
          ) {
            throw new AppError(
              status.UNAUTHORIZED,
              "Unauthorized access! User is not active.",
            );
          }

          if (user.isDeleted) {
            throw new AppError(
              status.UNAUTHORIZED,
              "Unauthorized access! User is deleted.",
            );
          }

          if (roles.length > 0 && !roles.includes(user.role as UserRole)) {
            throw new AppError(
              status.FORBIDDEN,
              "Forbidden access! You do not have permission to access this resource.",
            );
          }

          req.user = {
            userId: user.id,
            role: user.role,
            email: user.email,
          };

          return next();
        }
      }

      // verify access token
      const accessToken = CookieUtils.getCookie(req, "accessToken");

      if (!accessToken) {
        throw new AppError(
          status.UNAUTHORIZED,
          "Unauthorized: No access token provided",
        );
      }

      const verifiedToken = jwtUtils.verifyToken(
        accessToken,
        env.ACCESS_TOKEN_SECRET,
      );
      if (!verifiedToken.success) {
        throw new AppError(
          status.UNAUTHORIZED,
          "Unauthorized: Invalid access token",
        );
      }

      if (
        roles.length > 0 &&
        !roles.includes(verifiedToken.decoded!.role as UserRole)
      ) {
        throw new AppError(
          status.FORBIDDEN,
          "Forbidden access! You do not have permission to access this resource.",
        );
      }

      return next();
    } catch (err: any) {
      return next(err);
    }
  };
}
