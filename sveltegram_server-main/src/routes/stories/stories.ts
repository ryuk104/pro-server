
import express from 'express'
const router = express.Router()
import mongoose from 'mongoose'
//const Stories = mongoose.model("Stories")
import Stories from "../../models/stories";
import { checkAuth } from "../../middlewares/authenticate";



router.get('/allstories',(req,res)=>{
    Stories.find()
    .populate("postedBy","_id name")
    .then(stories =>{
        res.json({stories})
    })
    .catch(err=>{
        console.log(err)
    })
})

router.get('/:storyId',(req,res)=>{

	const { storyId } = req.params;
    Stories.findById({
        _id: storyId
    })
    .then(stories =>{
        res.json({stories})
    })
    .catch(err=>{
        console.log(err)
    })
})

//add requiredLogin
router.post('/creatstories', checkAuth, (req,res)=>{
    const {title,body,photo} =req.body
    if(!title || !body){
        return res.status(422).json({error:"enter all the fields"})
    }
    const stories = new Stories({
        title,
        body,
        photo,
        postedBy: req.user
    })
    stories.save().then(result=>{
        res.json({stories:result})
    })
    .catch(err=>{
        console.log(err)
    })
})

//add requiredLogin
router.get('/mystories',(req,res)=>{
    Stories.find({postedBy:req.user._id})
    .populate("postedBy","_id name")
    .then(mystories=>{
        res.json({mystories})
    })
    .catch(err=>{
        console.log(err)
    })
})
















export default router;
