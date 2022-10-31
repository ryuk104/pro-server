import { model, Schema } from "mongoose";
import mongoose from 'mongoose';




const postSchema = new Schema(
  {
    title: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    tags: {
      type: [String],
    },
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    likesCount: {
    type: Number,
    default: 0,
    },
    image: String,
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    /*
    comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
    commentsCount: {
    type: Number,
    default: 0,
  },
  */
  createdAt: {
    type: Date,
    default: Date.now,
  },
  },
  { timestamps: true }
);

export default mongoose.model('Post', postSchema);

