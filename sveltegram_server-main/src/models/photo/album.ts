const mongoose = require("mongoose");

const AlbumSchema = new mongoose.Schema({
  ownerId: {
    type: String,
    ref: "User",
    required: true,
  },
  id: {
    type: mongoose.Schema.ObjectId,
    ref: "Post",
    required: true,
  },
  albumName: {
    type: String,
    required: [true, "Please enter the comment"],
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  assets:{type:String,required:true},
    
  albumThumbnailAssetId: {
    type: Date,
    default: Date.now,
  },
  sharedUsers: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('album', AlbumSchema);
