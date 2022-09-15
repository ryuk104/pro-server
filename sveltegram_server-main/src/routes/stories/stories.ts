
import express from 'express'
const router = express.Router()
import mongoose from 'mongoose'
//const Stories = mongoose.model("Stories")
import Stories from "../../models/stories";


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

//add requiredLogin
router.post('/creatstories',(req,res)=>{
    const {title,body} =req.body
    if(!title || !body){
        return res.status(422).json({error:"enter all the fields"})
    }
    const stories = new Stories({
        title,
        body,
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
