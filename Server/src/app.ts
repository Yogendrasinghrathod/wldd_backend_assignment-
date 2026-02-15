import "dotenv/config";
import express from "express";
import authRoutes from "./routes/authRoute";
import taskRoutes from "./routes/taskRoute";

const app = express();
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

export default app;
