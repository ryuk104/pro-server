import mongoose from "mongoose";

const shortSchema = new mongoose.Schema({
  creator: {
    tpye: String,
    ref: "User"
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
