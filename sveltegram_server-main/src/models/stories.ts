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
        type:String,
        default:"no Photo"
    },
    postedBy:{
        type:ObjectId,
        ref:"User"
    }
    }
);
module.exports = mongoose.model("Stories", storiesSchema);
