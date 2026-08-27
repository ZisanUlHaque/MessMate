import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

import { AppError } from "../utils/AppError";
import { env } from "../lib/env";
import { prisma } from "../lib/prisma";
import { MemberStatus, UserRole } from "../../generated/prisma/enums";

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.split(" ")[1]
      : null;
    if (!token) return next(new AppError(401, "Not logged in"));
    const decoded = jwt.verify(token, env.JWT_SECRET) as { id: string };
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, fullName: true, phone: true, role: true },
    });
    if (!user) return next(new AppError(401, "User not found"));
    req.user = user;
    next();
  } catch (error) {
    next(new AppError(401, "Invalid or expired token"));
  }
};

export const restrictTo =
  (...roles: UserRole[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user!.role))
      return next(new AppError(403, "Permission denied"));
    next();
  };

export const checkMessMembership = (paramName = 'id') => async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Safely extract messId from params, body, or query
    const messId = 
      (req.params && req.params[paramName]) || 
      (req.body && req.body[paramName]) || 
      (req.query && (req.query[paramName] || req.query.messId));
    
    if (!messId || typeof messId !== 'string') {
      return next(new AppError(400,'Mess ID required or invalid'));
    }
    
    const membership = await prisma.messMember.findUnique({ 
      where: { 
        messId_userId: { 
          messId: messId, 
          userId: req.user!.id 
        } 
      } 
    });
    
    if (!membership || membership.status !== MemberStatus.APPROVED) {
      return next(new AppError(403,'Not an approved member of this mess'));
    }
    
    next();
  } catch (error) { 
    next(error); 
  }
};

export const checkMessManager = (paramName = 'id') => async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Safely extract messId from params, body, or query
    const messId = 
      (req.params && req.params[paramName]) || 
      (req.body && req.body[paramName]) || 
      (req.query && (req.query[paramName] || req.query.messId));
    
    if (!messId || typeof messId !== 'string') {
      return next(new AppError(400,'Mess ID required or invalid'));
    }

    const membership = await prisma.messMember.findUnique({ 
      where: { 
        messId_userId: { 
          messId: messId, 
          userId: req.user!.id 
        } 
      } 
    });
    
    if (!membership || membership.status !== MemberStatus.APPROVED || membership.role !== UserRole.MANAGER) {
      return next(new AppError(403,'Manager access required'));
    }
    
    next();
  } catch (error) { 
    next(error); 
  }
};
