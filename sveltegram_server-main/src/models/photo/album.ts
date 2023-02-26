import mongoose from "mongoose";
import { model, Schema } from "mongoose";


const AlbumSchema = new mongoose.Schema({
  ownerId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    //required: true,
  },
  id: {
    type: Schema.Types.ObjectId,
    //required: true,
  },
  albumName: {
    type: String,
    trim: true,
    required: true,
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
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  assetCOunt: {
    type: Number,
  },
});



export default mongoose.model('album', AlbumSchema);
