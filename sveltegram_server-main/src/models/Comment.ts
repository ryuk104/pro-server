const mongoose = require("mongoose");
import { model, Schema } from "mongoose";


const CommentSchema = new mongoose.Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  post: {
    type: Schema.Types.ObjectId,
    ref: "Post",
    required: true,
  },
  text: {
    type: String,
    required: [true, "Please enter the comment"],
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  comment:{type:String,required:true},
    post_id:{type:mongoose.Schema.Types.ObjectId,ref:'Post',required:true},
    user_id:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},
});

export default mongoose.model('Comment', CommentSchema);
