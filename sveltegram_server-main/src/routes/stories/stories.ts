
import express from 'express'
const router = express.Router()
import mongoose from 'mongoose'
//const Stories = mongoose.model("Stories")
import Stories from "../../models/stories";
import User from "../../models/user"
import { authenticate, checkAuth } from "../../middlewares/authenticate";


// add people you know
router.get('/allstories',  checkAuth, (req,res)=>{
  
//add to get user followings : followings: req.user.followings
    Stories.find()
    .populate("postedBy","_id name")
    .then(stories =>{
        res.json({stories})
    })
    .catch(err=>{
        console.log(err)
    })
})

//get specific story
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

//create story
router.post('/creatstories', checkAuth, (req,res)=>{
    const {title,body,photo} =req.body
    if(!title || !body){
        return res.status(422).json({error:"enter all the fields"})
    }
    const stories = new Stories({
        creator : req.user._id,
        title,
        body,
        photo,
        postedBy: req.user._id,
        views: 0,
    })
    stories.save().then(result=>{
        res.json({stories:result})
    })
    .catch(err=>{
        console.log(err)
    })
})

//fix
router.get('/mystories', checkAuth, (req,res)=>{
    Stories.find({postedBy: req.user._id})
    .populate("postedBy","_id name")
    .then(mystories=>{
        res.json({mystories})
    })
    .catch(err=>{
        console.log(err)
    })
})

//like story
router.put('/:storyId/like', checkAuth, async (req,res, next)=>{
  try {
    const story = await Stories.findByIdAndUpdate(
      req.params.storyId,
      {
        $push: { likes: req.user._id},
        $inc: {'likesCount': 1 }
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
  } catch (error) {
    return next(error);
  }
})


//unlike story
router.delete('/:storyId/unlike', checkAuth, async (req,res, next)=>{
  try {
    const { storyId } = req.params;

    let story = await Stories.findByIdAndUpdate(
      storyId,
      {
        $pull: { likes: req.user._id },
        $inc: {'likesCount': -1 }
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
  } catch (error) {
    return next(error);
  }
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

//fix
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


//edit story
router.put('/:storyId', checkAuth, async (req,res,next)=>{
  try {
    const { storyId } = req.params;

    const story = await Stories.findById(storyId);

    if (!story) {
      return next({ status: 404, message: 'POST_NOT_FOUND' });
    }

    if (story.postedBy.toString() !== req.user._id.toString()) {
      return next({ status: 401, message: 'ACCESS_DENIED_ERR' });
    }

    const modify = await Stories.findByIdAndUpdate(storyId, req.body, {
      new: true,
    })
      .populate("user", "name profilePic")
      .populate("likes", "name profilePic");

    return res.status(201).json({
      type: "success",
      message: "post updated successfully",
      data: {
        post: modify,
      },
    });
  } catch (error) {
    return next(error);
  }

})
  
//delete story 
router.delete('/:storyId', checkAuth, async (req,res,next)=>{
  try {

    const { storyId } = req.params;

    const story = await Stories.findById(storyId);

    if (!story) {
      return next({ status: 404, message: 'POST_NOT_FOUND' });
    }

    if (story.postedBy._id.toString() !== req.user._id.toString()) {
      return next({ status: 401, message: 'ACCESS_DENIED_ERR' });
    }

    await story.delete();

    return res.status(201).json({
      type: "success",
      message: "post deleted successfully",
      data: null,
    });
  } catch (error) {
    return next(error);
  }

})
  

















export default router;
