const mongoose = require('mongoose');
import { model, Schema } from "mongoose";
const {ObjectId} = mongoose.Schema.Types

const storiesSchema = new mongoose.Schema(
    {
    creator: {
        type: Schema.Types.ObjectId,
        ref: "User",
        },
    title : {
        type: String,
        default:"title"
        },
    body : {
        type: String,
        default:"body"
        },
    photo : {
        type: Array,
        default:"no Photo"
    },
    postedBy:{
        type:ObjectId,
        ref:"User"
    },
    views:{
        type: Number,
        ref:"User"
    },
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }, ],
    likesCount: {
    type: Number,
    default: 0,
    },
    comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
    commentsCount: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
    }
);

export default mongoose.model('Stories', storiesSchema);

