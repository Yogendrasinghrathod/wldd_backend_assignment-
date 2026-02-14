import mongoose from "mongoose";

const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("DB connected Successfully");
  } catch (error) {
    console.error("Db connection fail");
    process.exit(1);
  }
};

export default connectDB;
