import {Schema, model} from 'mongoose';

interface Friend {
    requester: any;
    recipient: any;
    status: number
}

const schema = new Schema<Friend>({
    requester: { type: Schema.Types.ObjectId, ref: 'User'},
    recipient: { type: Schema.Types.ObjectId, ref: 'User'},
    status: {
      type: Number,
      enums: [
          0, //'requested',
          1, //'pending',
          2, //'friends',
      ]
    }
})


export const Friends = model<Friend>('friends', schema);