const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema({
    deviceAssetId: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  deviceId: {
    type: mongoose.Schema.ObjectId,
    ref: "Post",
    required: true,
  },
  assetType: {
    type: String,
    required: [true, "Please enter the comment"],
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  modifiedAt:{type:String,required:true},
    
  isFavorite: {
    type: Date,
    default: Date.now,
  },
  duration: {
    type: Date,
    default: Date.now,
  },
  id: {
    type: Date,
    default: Date.now,
  },
  userId: {
    type: Date,
    default: Date.now,
  },
  duration: {
    type: Date,
    default: Date.now,
  },
  duration: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Comment', CommentSchema);
