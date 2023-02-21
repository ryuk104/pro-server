
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
        stories.views({$inc : {'views' : 1}})
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

router.put('/:storyId/like', checkAuth, (req,res)=>{
        const currentUser = res.locals.user;
        const story = Stories.findByIdAndUpdate(
          req.params.storyId,
          {
            $push: { likes: currentUser._id },
          },
          { new: true }
        )
          .populate("likes", "name profilePic")
          .populate("user", "name profilePic");
        return res.status(201).json({
          type: "success",
          message: "post liked successfully",
          data: {
            story,
          },
        });
      
    
})

  
router.delete('/:storyId/unlike', checkAuth, (req,res)=>{
        const currentUser = res.locals.user;
        const { storyId } = req.params;
    
        let story = Stories.findByIdAndUpdate(
          storyId,
          {
            $pull: { likes: currentUser._id },
          },
          { new: true }
        )
          .populate("user", "name profilePic")
          .populate("user", "name profilePic");
    
        return res.status(201).json({
          type: "success",
          message: "post unlike successfully",
          data: {
            story,
          },
        });
})

router.get('/:storyId/comment', checkAuth, (req,res)=>{
    const currentUser = res.locals.user;
    const story = Stories.findByIdAndUpdate(
      req.params.storyId,
    )
      .populate("likes", "name profilePic")
      .populate("user", "name profilePic");
    return res.status(201).json({
      type: "success",
      message: "post liked successfully",
      data: {
        story,
      },
    });
  

})


router.post('/:storyId/comment', checkAuth, (req,res)=>{
    const currentUser = res.locals.user;
    const { storyId } = req.params;

    let story = Stories.findByIdAndUpdate(
      storyId,
      {
        $pull: { likes: currentUser._id },
      },
      { new: true }
    )
      .populate("user", "name profilePic")
      .populate("user", "name profilePic");

    return res.status(201).json({
      type: "success",
      message: "post unlike successfully",
      data: {
        story,
      },
    });
})

  













export default router;
