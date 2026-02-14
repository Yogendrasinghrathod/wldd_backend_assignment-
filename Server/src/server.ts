import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db";

import authRoutes from "./routes/authRoute";
dotenv.config();
const app = express();
app.use(express.json());
app.use("/api/auth", authRoutes);
connectDB();
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
