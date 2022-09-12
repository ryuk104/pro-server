const express = require("express");
const router = express.Router();

import Videos from '../../models/shorts';
import Data from "./data.js";




// api endpoints
// GET
router.get("/", (req, res) => res.status(200).send("Hellow coy"));

// GET post
router.get("/v1/posts", (req, res) => res.status(200).send(Data));

// GET data from mongodb cloud database
router.get("/v2/posts", (req, res) => {
  Videos.find((err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(data);
    }
  });
});

// POST
router.post("/v2/posts", (req, res) => {
  // POST request is to ADD DATA to the database
  // It will let us ADD a video DOCUMENT to the videos COLLECTION
  const dbVideos = req.body;

  Videos.create(dbVideos, (err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(201).send(data);
    }
  });
});



/*
//add this to api 
exports.likeCreate = functions.firestore.document('post/{id}/{type}/{uid}').onCreate((_, context) => {
  let updateObj = {}
  if (context.params.type == 'comments') {
      updateObj = {
          commentsCount: admin.firestore.FieldValue.increment(1)
      }
  }
  if (context.params.type == 'likes') {
      updateObj = {
          likesCount: admin.firestore.FieldValue.increment(1)
      }
  }
  return db
      .collection("post")
      .doc(context.params.id)
      .update(updateObj)
})

exports.likeDelete = functions.firestore.document('post/{id}/{type}/{uid}').onDelete((_, context) => {
  let updateObj = {}
  if (context.params.type == 'comments') {
      updateObj = {
          commentsCount: admin.firestore.FieldValue.increment(-1)
      }
  }
  if (context.params.type == 'likes') {
      updateObj = {
          likesCount: admin.firestore.FieldValue.increment(-1)
      }
  }
  return db
      .collection("post")
      .doc(context.params.id)
      .update(updateObj)
})

*/


export default router;
