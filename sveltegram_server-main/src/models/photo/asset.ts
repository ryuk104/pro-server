import { boolean } from "yup";
import { model, Schema } from "mongoose";
import mongoose from "mongoose";

const assetSchema = new mongoose.Schema({
    deviceAssetId: {
    type: Schema.Types.ObjectId,
    ref: "devices",
    //required: true,
  },
  deviceId: {
    type: Schema.Types.ObjectId,
    ref: "devices",
    //required: true,
  },
  id: {
    type: Schema.Types.ObjectId,
  },
  assetType: {
    type: String,
    //required: [true, "Please enter the comment"],
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  //modifiedAt:{type:String,required:true},
    
  isFavorite: {
    type: Boolean,
    default: false,
  },
  duration: {
    type: Date,
    default: Date.now,
  },
  userId: {
    type: String,
    ref: "User"
  },

  type: {
    type: String,
    enum: ['IMAGE', 'VIDEO', 'AUDIO', 'OTHER']  
  },
  ownerId: {
    type: String,
    ref: "User"
  },
  lensModel: {
    type: String,
  },
  fNumber: {
    type: Number,
  },
  focalLength: {
    type: Number,
  },
  iso: {
    type: Number,
  },
  exposureTime: {
    type: Number,
  },
  latitude: {
    type: Number,
  },
  longitude: {
    type: Number,
  },
  city: {
    type: String,
  },
  state: {
    type: String,
  },
  country: {
    type: String,
  },
  originalPath: {
    tpye: String
  }

});

export default mongoose.model('asset', assetSchema);
