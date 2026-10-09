import cookieParser from "cookie-parser";
import cors from "cors";
import express, {
  type Application,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import helmet from "helmet";
import morgan from "morgan";
import httpStatus from "http-status";
import { authRoutes } from "./app/module/auth/auth.route";
import { messRoutes } from "./app/module/mess/mess.route";
import { mealRoutes } from "./app/module/meal/meal.route";
import { bazarRoutes } from "./app/module/bazar/bazar.route";
import { billRoutes } from "./app/module/bill/bill.routes";
import { notificationRoutes } from "./app/module/Notification & Cron/otification.routes";
import { notFound } from "./app/middleware/notFound.middleware";

// Configs & Middlewares

// MessMate Module Routes

const app: Application = express();

// Middlewares
app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);
app.use(helmet());

// Enable URL-encoded form data parsing
app.use(express.urlencoded({ extended: true }));

// Middleware to parse JSON bodies
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Application Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/mess", messRoutes);
app.use("/api/v1/meals", mealRoutes);
app.use("/api/v1/bazar", bazarRoutes);
app.use("/api/v1/bills", billRoutes);
app.use("/api/v1/notifications", notificationRoutes);

// Test Route
app.get("/test", async (req: Request, res: Response, next: NextFunction) => {
  try {
    // You can integrate your getBkashIdToken() or DB health check here later
    res.status(httpStatus.OK).json({
      success: true,
      message: "MessMate Test Route Working",
      data: null,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

// Basic Route
app.get("/", async (req: Request, res: Response) => {
  res.status(httpStatus.OK).json({
    success: true,
    message: "Welcome to MessMate API",
  });
});

// Not Found & Global Error Handler
app.use(notFound);
// app.use(globalErrorHandler);

export default app;
