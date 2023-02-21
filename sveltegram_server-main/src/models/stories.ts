const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema.Types

const storiesSchema = new mongoose.Schema(
    {
    title : {
        type: String,
        default:"title"
        },
    body : {
        type: String,
        default:"body"
        },
    photo : {
        type: Array,
        default:"no Photo"
    },
    postedBy:{
        type:ObjectId,
        ref:"User"
    },
    views:{
        type: Number,
        ref:"User"
    },
    likes:{
        type: Number,
        ref:"User"
    },
    comments: {
        type: Array,
        ref: "User"
    }
    }
);

export default mongoose.model('Stories', storiesSchema);

