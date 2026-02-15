
// Task: title, description, status (pending | completed), dueDate, owner (User ref), createdAt

import mongoose, { Document, Schema } from "mongoose";

type TaskStatus = "pending" | "completed";

interface ITask extends Document {
  title: string;
  description?: string;
  status: TaskStatus;
  dueDate?: Date;
  owner: mongoose.Types.ObjectId;
  createdAt: Date;
}

const TaskSchema: Schema<ITask> = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
    },
    dueDate: {
      type: Date,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: false,
    },
  },
);



TaskSchema.index({owner:1,status:1});

const Task=mongoose.model<ITask>("Task",TaskSchema)

export default Task;