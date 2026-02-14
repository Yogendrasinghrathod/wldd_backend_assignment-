import mongoose, { Document, Schema }  from "mongoose";


export interface IUser extends Document{
    name:string,
    email:string,
    password:string,
    createdAt:Date
}

const UserSchema:Schema<IUser>=new Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
    },
    password:{
        type:String,
        required:true
    }


},{timestamps:{createdAt:true,updatedAt:false}})

const User =mongoose.model<IUser>("User",UserSchema);

export default User;