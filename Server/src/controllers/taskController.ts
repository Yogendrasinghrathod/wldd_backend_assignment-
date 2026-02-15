import { Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";
import Task from "../models/task";
import redisClient from "../config/redis";

export const getTask = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    // flow  -> check cache for task if not found get it from db and save it in redis then return task , if found in redis then return from there
    const userId = req.userId as String;
    const status = req.query.status as string; // /api/tasks?status=pending  or /api/tasks?status=completed
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;
    const filter: any = { owner: userId };
    if (status) {
      filter.status = status;
    }

    if (startDate && endDate) {
      filter.dueDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    } else if (startDate) {
      filter.dueDate = {
        $gte: new Date(startDate),
      };
    }
    else if(endDate){
      filter.dueDate={
        $lte:new Date(endDate)
      }
    }

    const cacheKey = `tasks:${userId}:${JSON.stringify(req.query)}`;
    const cacheData = await redisClient.get(cacheKey);
    if (cacheData) {
      res.status(200).json(JSON.parse(cacheData));
      return;
    }

    const tasks = await Task.find(filter);

    await redisClient.set(cacheKey, JSON.stringify(tasks), { EX: 60 });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
    });
  }
};

export const createTask = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.userId as String;
    const task = await Task.create({
      ...req.body,
      owner: userId,
    });
    await redisClient.del(`tasks:${userId}`);
    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
    });
  }
};

export const updateTask = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.userId as String;
    const task = await Task.findByIdAndUpdate(
      {
        _id: req.params.id,
        owner: userId,
      },
      req.body,
      { new: true },
    );

    if (!task) {
      res.status(404).json({
        message: "Task not found",
      });
      return;
    }
    await redisClient.del(`tasks:${userId}`);
    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
    });
  }
};

export const deleteTask = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.userId as String;
    const task = await Task.findByIdAndDelete({
      _id: req.params.id,
      owner: userId,
    });

    if (!task) {
      res.status(404).json({
        message: "task not found",
      });
      return;
    }
    await redisClient.del(`tasks:${userId}`);
    res.status(200).json({
      message: "Task Deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
    });
  }
};
