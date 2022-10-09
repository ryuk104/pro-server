const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
    title:{type:String},
    description:{type:String},
    images:[{type:String}],
    user_id:{type:mongoose.Schema.Types.ObjectId,ref:'user',required:true},
    tags:[{type:mongoose.Schema.Types.ObjectId,ref:'tag'}],
    likedby:[{type:mongoose.Schema.Types.ObjectId,ref:'user'}]
},{
    timestamps:true,
    versionKey:false
})

const Post = mongoose.model('blog',blogSchema);

module.exports = blogSchema;

