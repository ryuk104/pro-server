import {model, Schema} from 'mongoose';

export interface Device {
  user: any
  userId: string,
  token: string,
  platform: string,
}


const schema = new Schema<Device>({
  user: { type: Schema.Types.ObjectId, ref: "User" },
  userId: {type: String},
  token: { type: String, unique: true },
  platform: { type: String },
  deviceType: { type: String, enum: [
    "IOS", 
    "ANDROID", 
    "WEB"
  ], 
  },
  deviceId: { type: String },
  isAutoBackup: { type: Boolean },

});

export const Devices = model<Device>("devices", schema);
