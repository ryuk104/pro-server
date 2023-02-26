const express = require("express");
const router = express.Router();

import shortsVideos from '../../models/shorts';
import Data from "./data.js";
import { checkAuth } from "../../middlewares/authenticate";



// GET data from mongodb cloud database
router.get("/shorts", (req, res) => {
  shortsVideos.find((err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(data);
    }
  });
});

// GET data from mongodb cloud database
router.get("/shorts/:shortId", (req, res) => {
  let {shortId} = req.params
  shortsVideos.findById(( shortId , err) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200);
    }
  });
});


// POST
router.post("/shorts", (req, res) => {
  // POST request is to ADD DATA to the database
  // It will let us ADD a video DOCUMENT to the videos COLLECTION
  const dbVideos = req.body;

  shortsVideos.create(dbVideos, (err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(201).send(data);
    }
  });
});


router.put('/:storyId/like', checkAuth, (req,res)=>{
  const currentUser = res.locals.user;
  const story = shortsVideos.findByIdAndUpdate(
    req.params.storyId,
    {
      $push: { likes: currentUser._id },
    },
    { new: true }
  )
    .populate("likes", "name profilePic")
    .populate("User", "name profilePic");
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

  let story = shortsVideos.findByIdAndUpdate(
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



export default router;
