import mongoose from "mongoose";
import { model, Schema } from "mongoose";


const shortSchema = new mongoose.Schema({
    creator: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    video: { 
      type: String, 
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
    song: { 
      type: String,
      default: "No song"
    },
    views: { 
      type: Number, 
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
  
    

  shares: { 
    type: String, 
    },
    
});

// Collection inside the database
export default mongoose.model("shortsVideos", shortSchema);
