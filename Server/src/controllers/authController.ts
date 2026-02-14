import { Request, Response } from "express";
import User, { IUser } from "../models/user";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const signup = async (req: Request, res: Response): Promise<void> => {
 try {
     const { email, password, name } = req.body;
  //check if user already exist
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(400).json({
      message: "User exists already",
    });
    return;
  }

  // password to be hashed  by bcyrpt
  const hashedPassword = await bcrypt.hash(password, 10);

  const user: IUser = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  req.body.password=""
  res.status(200).json({
    message:"User created Successfully",
    userId:user._id
  })
 } catch (error) {
    console.error("Error signup")
    res.status(500).json({
        message:"Server Error"
    })
 }
};

export const login = async(req:Request,res:Response):Promise<void>=> {
    try {
        const{email,password}=req.body;
        const user=await User.findOne({email});
        if(!user){
            res.status(400).json({
                message:"Invalid Cridentials"
            })
            return ;
        }
        const isMatch=await bcrypt.compare(password,user.password);
        if(!isMatch){
            res.status(400).json({
                message:"Invalid Cridentials"
            })
            return ;
        }
        const payload={
            userId:user._id,
        }
        const token=await jwt.sign(payload,
            process.env.JWT_SECRET as string,{expiresIn:"1d"}
        )


        res.status(200).json({
            message:"login Succesfull",
            token
        })



    } catch (error) {
        res.status(500).json({
            message:"Server Error"
        })
    }
};
