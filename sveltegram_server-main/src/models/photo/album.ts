const mongoose = require("mongoose");

const AlbumSchema = new mongoose.Schema({
  ownerId: {
    type: String,
    ref: "User",
    //required: true,
  },
  id: {
    type: mongoose.Schema.ObjectId,
    //required: true,
  },
  albumName: {
    type: String,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  assets:{
    type:String,
    ref: "asset"
  },
    
  albumThumbnailAssetId: {
    type: Date,
    default: Date.now,
  },
  sharedUsers: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('album', AlbumSchema);
