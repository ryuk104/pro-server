import express from 'express'
const router = express.Router()
import mongoose from 'mongoose'

import shortsVideos from '../../models/shorts';
import { checkAuth } from "../../middlewares/authenticate";



// gets a short
router.get("/shorts", (req, res) => {
  shortsVideos.find((err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(data);
    }
  });
});

// gets a specific short
router.get("/:shortId", checkAuth, (req, res) => {
  const { shortId } = req.params;
  shortsVideos.findById({
    _id: shortId
})
.then(short =>{
    //short.views({$inc : {'views' : 1}})
    res.json({short})
})
.catch(err=>{
    console.log(err)
})
});


// create shorts
router.post("/shorts", checkAuth, (req, res) => {
  // POST request is to ADD DATA to the database
  // It will let us ADD a video DOCUMENT to the videos COLLECTION
  const shorts = new shortsVideos({
        creator: req.user._id,
        video: req.body.video,
        views: 0,
        description: req.body.description,
        tags: req.body.tags,
        //add songs
    });

  shortsVideos.create(shorts, (err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(201).send(data);
    }
  });
});

// like shorts
router.put('/:shortsId/like', checkAuth, async (req,res, next)=>{
  try {
    const shorts = await shortsVideos.findByIdAndUpdate(
      req.params.shortsId,
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
        shorts,
      },
    });
  } catch (error) {
    return next(error);
  }


})

// unlike shorts
router.delete('/:shortsId/unlike', checkAuth, async (req,res, next)=>{
  try {
    const { shortsId } = req.params;

    let shorts = await shortsVideos.findByIdAndUpdate(
      shortsId,
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
        shorts,
      },
    });
  } catch (error) {
    return next(error);
  }
})

//edit shorts 
router.put('/:shortsId', checkAuth, async (req,res,next)=>{
  try {
    const { shortsId } = req.params;

    const short = await shortsVideos.findById(shortsId);

    if (!short) {
      return next({ status: 404, message: 'POST_NOT_FOUND' });
    }

    if (short.creator.toString() !== req.user._id.toString()) {
      return next({ status: 401, message: 'ACCESS_DENIED_ERR' });
    }

    const modify = await shortsVideos.findByIdAndUpdate(shortsId, req.body, {
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

router.get("/:shortsId/comment", (req, res) => {
  shortsVideos.find((err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(data);
    }
  });
});

router.post("/:shortsId/comment", (req, res) => {
  shortsVideos.find((err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(data);
    }
  });
});

router.delete("/:shortsId", checkAuth, async (req, res, next) => {
  try {

    const { shortsId } = req.params;

    const shorts = await shortsVideos.findById(shortsId);

    if (!shorts) {
      return next({ status: 404, message: 'POST_NOT_FOUND' });
    }

    if (shorts.creator._id.toString() !== req.user._id.toString()) {
      return next({ status: 401, message: 'ACCESS_DENIED_ERR' });
    }

    await shorts.delete();

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
