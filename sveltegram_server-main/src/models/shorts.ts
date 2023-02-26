import mongoose from "mongoose";
import { model, Schema } from "mongoose";


const shortSchema = new mongoose.Schema({
    creator: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    song: { 
      type: String,
      default: "No song"
    },
    views: { 
      type: Number, 
    },
    likes: { 
      type: Number, 
    },
    
    messages: { 
      type: String, 
    },
    
    description: { 
      type: String, 
    },
    
  shares: { 
    type: String, 
    },
    
});

// Collection inside the database
export default mongoose.model("shortsVideos", shortSchema);
