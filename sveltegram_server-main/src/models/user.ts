import { model, Schema } from "mongoose";
import mongoose from "mongoose";


const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },

    bio: {
      type: String,
      trim: true,
    },

    profilePic: {
      type: String,
      trim: true,
    },

    followers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    followings: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isActive: {
      type: Boolean,
      default: false,
    },

    lastSeen: {
      type: Date,
    },
  },
  { timestamps: true }
);

//userSchema.index({ "$**": "text" });
//module.exports = model("User", userSchema);
//export const User = model('User', userSchema);
export default mongoose.model('User', userSchema);



