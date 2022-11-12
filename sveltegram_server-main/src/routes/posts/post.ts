import express from "express";
const router = express.Router();

import Post from "../../models/post";
import User from "../../models/user";
import Comment from "../../models/Comment";

import asyncHandler from 'express-async-handler'


import { checkAuth } from "../../middlewares/authenticate";



const getAllPosts = async (req, res, next) => {
  try {
    let { page, limit } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    const posts = await Post.find()
      .sort("-createdAt")
      .limit(limit)
      .skip(limit * page)
      .populate("user", "-password")
      .populate({
        path: "comments",
        select: "text",
        populate: {
          path: "user",
          select: "username avatar",
        },
      })
      .populate("likes", "name profilePic");
    const totalPosts = await Post.estimatedDocumentCount();

    return res.status(200).json({
      type: "success",
      message: "fetch all posts",
      data: {
        posts,
        pagination: {
          totalPosts,
          totalPage: Math.ceil(totalPosts / limit),
        },
      },
    });
  } catch (error) {
    return next(error);
  }
};

const explorePosts = async (req, res, next) => {
  try {
    const currentUser = res.locals.user;
    let { page, limit } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    console.log("followings", currentUser.followings);

    const posts = await Post.find()
      .sort("-createdAt")
      .limit(limit)
      .skip(limit * page)
      .populate("user", "-password")
      .populate("likes", "name profilePic");
    const totalPosts = await Post.estimatedDocumentCount();

    return res.status(200).json({
      type: "success",
      message: "fetch all posts",
      data: {
        posts,
        pagination: {
          totalPosts,
          totalPage: Math.ceil(totalPosts / limit),
        },
      },
    });
  } catch (error) {
    return next(error);
  }
};
/*
const getPost = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id)
    .populate({
      path: "comments",
      select: "text",
      populate: {
        path: "user",
        select: "username avatar",
      },
    })
    .populate({
      path: "user",
      select: "username avatar",
    })
    .lean()
    .exec();

  if (!post) {
    return next({
      message: `No post found for id ${req.params.id}`,
      statusCode: 404,
    });
  }

  // is the post belongs to loggedin user?
  post.isMine = req.user.id === post.user._id.toString();

  // is the loggedin user liked the post??
  const likes = post.likes.map((like) => like.toString());
  post.isLiked = likes.includes(req.user.id);

  // is the loggedin user liked the post??
  const savedPosts = req.user.savedPosts.map((post) => post.toString());
  post.isSaved = savedPosts.includes(req.params.id);

  // is the comment on the post belongs to the logged in user?
  post.comments.forEach((comment) => {
    comment.isCommentMine = false;

    const userStr = comment.user._id.toString();
    if (userStr === req.user.id) {
      comment.isCommentMine = true;
    }
  });

  res.status(200).json({ success: true, data: post });
});
*/
const getPostById = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.postId)
      .populate("user", "-passwprd")
      .populate("likes", "name profilePic");

    return res.status(200).json({
      type: "success",
      message: "fetch single post by id",
      data: {
        post,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const createPost = async (req, res, next) => {
  try {
    const currentUser = res.locals.user;

    const newPost = new Post({
      ...req.body,
      user: currentUser._id,
    });

    const savePost = await newPost.save();

    const post = await Post.findById(savePost._id)
      .populate("user", "name profilePic")
      .populate("likes", "name profilePic");

    return res.status(201).json({
      type: "success",
      message: " post created successfully",
      data: {
        post,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const updatePost = async (req, res, next) => {
  try {
    const currentUser = res.locals.user;

    const { postId } = req.params;

    const post = await Post.findById(postId);

    if (!post) {
      return next({ status: 404, message: 'POST_NOT_FOUND' });
    }

    if (post.user.toString() !== currentUser._id.toString()) {
      return next({ status: 401, message: 'ACCESS_DENIED_ERR' });
    }

    const modify = await Post.findByIdAndUpdate(postId, req.body, {
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
};

const deletePost = async (req, res, next) => {
  try {
    const currentUser = res.locals.user;

    const { postId } = req.params;

    const post = await Post.findById(postId);

    if (!post) {
      return next({ status: 404, message: 'POST_NOT_FOUND' });
    }

    if (post.user.toString() !== currentUser._id.toString()) {
      return next({ status: 401, message: 'ACCESS_DENIED_ERR' });
    }

    await post.delete();

    return res.status(201).json({
      type: "success",
      message: "post deleted successfully",
      data: null,
    });
  } catch (error) {
    return next(error);
  }
};

const likePost = async (req, res, next) => {
  try {
    const currentUser = res.locals.user;
    const post = await Post.findByIdAndUpdate(
      req.params.postId,
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
        post,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const unLikePost = async (req, res, next) => {
  try {
    const currentUser = res.locals.user;
    const { postId } = req.params;

    let post = await Post.findByIdAndUpdate(
      postId,
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
        post,
      },
    });
  } catch (error) {
    return next(error);
  }
};
/*
const addComment = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return next({
      message: `No post found for id ${req.params.id}`,
      statusCode: 404,
    });
  }

  let comment = await Comment.create({
    user: req.user.id,
    post: req.params.id,
    text: req.body.text,
  });

  post.comments.push(comment._id);
  post.commentsCount = post.commentsCount + 1;
  await post.save();

  comment = await comment
    .populate({ path: "user", select: "avatar username fullname" })
    .execPopulate();

  res.status(200).json({ success: true, data: comment });
});

const deleteComment = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return next({
      message: `No post found for id ${req.params.id}`,
      statusCode: 404,
    });
  }

  const comment = await Comment.findOne({
    _id: req.params.commentId,
    post: req.params.id,
  });

  if (!comment) {
    return next({
      message: `No comment found for id ${req.params.id}`,
      statusCode: 404,
    });
  }

  if (comment.user.toString() !== req.user.id) {
    return next({
      message: "You are not authorized to delete this comment",
      statusCode: 401,
    });
  }

  // remove the comment from the post
  const index = post.comments.indexOf(comment._id);
  post.comments.splice(index, 1);
  post.commentsCount = post.commentsCount - 1;
  await post.save();

  await comment.remove();

  res.status(200).json({ success: true, data: {} });
});
*/

/*
const toggleSave = asyncHandler(async (req, res, next) => {
  // make sure that the post exists
  const post = await Post.findById(req.params.id);

  if (!post) {
    return next({
      message: `No post found for id ${req.params.id}`,
      statusCode: 404,
    });
  }

  const { user } = req;

  if (user.savedPosts.includes(req.params.id)) {
    console.log("removing saved post");
    await User.findByIdAndUpdate(user.id, {
      $pull: { savedPosts: req.params.id },
    });
  } else {
    console.log("saving post");
    await User.findByIdAndUpdate(user.id, {
      $push: { savedPosts: req.params.id },
    });
  }

  res.status(200).json({ success: true, data: {} });
});
*/
router.post("/", checkAuth, createPost);
router.get("/explore", checkAuth, explorePosts);

router.put("/:postId", checkAuth, updatePost);

router.get ("/getAllPosts", (req, res) => {});

router.get("/", getAllPosts);


router.get("/:postId", getPostById);

router.delete("/:postId", checkAuth, deletePost);

router.put("/:postId/like", checkAuth, likePost);
router.put("/:postId/unlike", checkAuth, unLikePost);

//router.get("/:id/togglesave", toggleSave);
//router.post("/:id/comments", addComment);
//router.delete("/:id/comments/:commentId", deleteComment);

export default router;
