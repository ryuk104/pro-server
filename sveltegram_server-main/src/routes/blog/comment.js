import express from "express";
const router = express.Router();

const checkAuth = require('../../middlewares/authenticate');
const Comment = require('../../models/Comment')

router.post('/', checkAuth ,async (req,res)=>{
    let payload = {
        comment:req.body.comment,
        post_id:req.body.post_id,
        user_id:req.user._id
    };
    const comment = await Comment.create(payload);
    return res.status(201).json({comment});
})

export default router;