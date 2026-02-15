import app from "./app";
import connectDB from "./config/db";
import { connectRedis } from "./config/redis";

app.listen(3000, async () => {
  await connectDB();
  await connectRedis();
  console.log("Server is running on port 3000");
});
