import "dotenv/config";
import express from "express";
import connectDB from "./config/db";

import authRoutes from "./routes/authRoute";
import taskRoutes from "./routes/taskRoute";
import { connectRedis } from "./config/redis";
const app = express();
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
// connectDB();
app.listen(3000, async () => {
  await connectDB();
  await connectRedis();
  console.log("Server is running on port 3000");
});
