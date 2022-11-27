import {Schema, model} from 'mongoose';

interface BlockedUser {
    requester: any;
    recipient: any;
}

const schema = new Schema<BlockedUser>({
    requester: { type: Schema.Types.ObjectId, ref: 'User'},
    recipient: { type: Schema.Types.ObjectId, ref: 'User'},
})


export const BlockedUsers = model<BlockedUser>('blocked_users', schema);