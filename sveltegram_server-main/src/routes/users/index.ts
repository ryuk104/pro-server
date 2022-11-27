import express from "express";
const router = express.Router();

//import { User, PrivateUserProjection, emitEvent, UserUpdateEvent, handleFile, FieldErrors } from "../../utils/index";

// Middleware
import { authenticate } from "../../middlewares/authenticate";
import rateLimit from "../../middlewares/rateLimit";
import { checkAuth } from "../../middlewares/authenticate";

// Models
import User from "../../models/user";
import Post from "../../models/post";

// Policies
import authPolicy from "../../policies/authenticationPolicies";
import reCaptchaPolicy from "../../policies/reCaptchaPolicie";
import forceCaptcha from "../../policies/forceCaptcha";
import userPolicy from "../../policies/UserPolicies";


/*
import { customEmojiAdd } from "./custom/customEmojiAdd";
import { customEmojiDelete } from "./custom/customEmojiDelete";
import { customEmojiRename } from "./custom/customEmojiRename";
import { customStatusChange } from "./custom/customStatusChange";
import { serverPositionUpdate } from "./serverPositionUpdate";
import { statusChange } from "./statusChange";
*/


//dependicies
import bcrypt from "bcrypt";


export interface UserModifySchema {
	/**
	 * @minLength 1
	 * @maxLength 100
	 */
	username?: string;
	avatar?: string | null;
	/**
	 * @maxLength 1024
	 */
	bio?: string;
	accent_color?: number;
	banner?: string | null;
	password?: string;
	new_password?: string;
	code?: string;
}


/*
customEmojiAdd(router);
customEmojiDelete(router);
customEmojiRename(router);
customStatusChange(router);
serverPositionUpdate(router);
statusChange(router);
*/

router.get("/gifts", (req, res) => {
	// TODO:
	res.json([]).status(200);
});

/*
router.get("/", (req, res) => {
	const { id } = req.params;

	res.json(await User.getPublicUser(id));
});

router.get("/", (req, res) => {
	res.json(await User.findOne({ select: PrivateUserProjection, where: { id: req.user_id } }));
});

router.patch("/", route({ body: "UserModifySchema" }), async (req, res) => {
	const body = req.body as UserModifySchema;

	if (body.avatar) body.avatar = await handleFile(`/avatars/${req.user_id}`, body.avatar as string);
	if (body.banner) body.banner = await handleFile(`/banners/${req.user_id}`, body.banner as string);

	const user = await User.findOneOrFail({ where: { id: req.user_id }, select: [...PrivateUserProjection, "data"] });

	if (body.password) {
		if (user.data?.hash) {
			const same_password = await bcrypt.compare(body.password, user.data.hash || "");
			if (!same_password) {
				throw FieldErrors({ password: { message: req.("auth:login.INVALID_PASSWORD"), code: "INVALID_PASSWORD" } });
			}
		} else {
			user.data.hash = await bcrypt.hash(body.password, 12);
		}
	}

	if (body.new_password) {
		if (!body.password && !user.email) {
			throw FieldErrors({
				password: { code: "BASE_TYPE_REQUIRED", message: req.("common:field.BASE_TYPE_REQUIRED") }
			});
		}
		user.data.hash = await bcrypt.hash(body.new_password, 12);
	}

    if(body.username){
        var check_username = body?.username?.replace(/\s/g, '');
        if(!check_username) {
            throw FieldErrors({
                username: { code: "BASE_TYPE_REQUIRED", message: req.("common:field.BASE_TYPE_REQUIRED") }
            });
        }
    }

	user.assign(body);
	await user.save();

	// @ts-ignore
	delete user.data;

	// TODO: send update member list event in gateway
	await emitEvent({
		event: "USER_UPDATE",
		user_id: req.user_id,
		data: user
	} as UserUpdateEvent);

	res.json(user);
});
*/

const getUserById = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId)
      .populate("followers", "name profilePic")
      .populate("followings", "name profilePic");
    const userPosts = await Post.find({ user: userId })
      .populate("user", "name profilePic")
      .populate("likes", "name profilePic");

    return res.status(200).json({
      type: "success",
      message: "fetch user by id",
      data: {
        user,
        posts: userPosts,
      },
    });
  } catch (error) {
    next(error);
  }
};
/*
const getUsers = asyncHandler(async (req, res, next) => {
  let users = await User.find().select("-password").lean().exec();

  users.forEach((user) => {
    user.isFollowing = false;
    const followers = user.followers.map((follower) => follower._id.toString());
    if (followers.includes(req.user.id)) {
      user.isFollowing = true;
    }
  });

  users = users.filter((user) => user._id.toString() !== req.user.id);

  res.status(200).json({ success: true, data: users });
});
*/

/*
const getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ username: req.params.username })
    .select("-password")
    .populate({ path: "posts", select: "files commentsCount likesCount" })
    .populate({ path: "savedPosts", select: "files commentsCount likesCount" })
    .populate({ path: "followers", select: "avatar username fullname" })
    .populate({ path: "following", select: "avatar username fullname" })
    .lean()
    .exec();

  if (!user) {
    return next({
      message: `The user ${req.params.username} is not found`,
      statusCode: 404,
    });
  }

  user.isFollowing = false;
  const followers = user.followers.map((follower) => follower._id.toString());

  user.followers.forEach((follower) => {
    follower.isFollowing = false;
    if (req.user.following.includes(follower._id.toString())) {
      follower.isFollowing = true;
    }
  });

  user.following.forEach((user) => {
    user.isFollowing = false;
    if (req.user.following.includes(user._id.toString())) {
      user.isFollowing = true;
    }
  });

  if (followers.includes(req.user.id)) {
    user.isFollowing = true;
  }

  user.isMe = req.user.id === user._id.toString();

  res.status(200).json({ success: true, data: user });
});
*/

const getAllUsers = async (req, res, next) => {
  try {
   
    let users;

    if (req.query.search) {
      users = await User.find({ $text: { $search: req.query.search } })
        .populate("followers", "name profilePic")
        .populate("followings", "name profilePic");
    } else {
      users = await User.find()
        .populate("followers", "name profilePic")
        .populate("followings", "name profilePic")
       
    }

    return res.status(200).json({
      type: "success",
      message: "fetch all users",
      data: {
        users,
      },
    });
  } catch (error) {
    next(error);
  }
};

const followUser = async (req, res, next) => {
  try {
    const currentUser = res.locals.user;
    const { userId } = req.params;

    let findUser = await User.findById(userId);
    let index = findUser.followers.findIndex(
      (u) => u._id.toString() == currentUser._id.toString()
    );
    if (index !== -1) {
      return next({ status: 400, message: "Already follow" });
    }

    await User.findByIdAndUpdate(
      userId,
      {
        $push: { followers: currentUser._id },
      },
      { new: true }
    );

    const user = await User.findByIdAndUpdate(
      currentUser._id,
      {
        $push: { followings: userId },
      },
      { new: true }
    )
      .populate("followers", "name profilePic")
      .populate("followings", "name profilePic");
    return res.status(200).json({
      type: "success",
      message: "follow user successfully",
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

const unFollowuser = async (req, res, next) => {
  try {
    const currentUser = res.locals.user;
    const { userId } = req.params;

    let findUser = await User.findById(userId);
    let index = findUser.followers.findIndex(
      (u) => u._id.toString() == currentUser._id.toString()
    );
    if (index === -1) {
      return next({ status: 400, message: "Yet not follow" });
    }

    await User.findByIdAndUpdate(
      userId,
      {
        $pull: { followers: currentUser._id },
      },
      { new: true }
    );

    const user = await User.findByIdAndUpdate(
      currentUser._id,
      {
        $pull: { followings: userId },
      },
      { new: true }
    )
      .populate("followers", "name profilePic")
      .populate("followings", "name profilePic");
    return res.status(200).json({
      type: "success",
      message: "unfollow user successfully",
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};
//combine these two
const editUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.userId, req.body, {
      new: true,
    })
      .populate("followers", "name profilePic")
      .populate("followings", "name profilePic");

    return res.status(200).json({
      type: "success",
      message: "update user data successfully",
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

/*
const editUser = asyncHandler(async (req, res, next) => {
  const { avatar, username, fullname, website, bio, email } = req.body;

  const fieldsToUpdate = {};
  if (avatar) fieldsToUpdate.avatar = avatar;
  if (username) fieldsToUpdate.username = username;
  if (fullname) fieldsToUpdate.fullname = fullname;
  if (email) fieldsToUpdate.email = email;

  const user = await User.findByIdAndUpdate(
    req.user.id,
    {
      $set: { ...fieldsToUpdate, website, bio },
    },
    {
      new: true,
      runValidators: true,
    }
  ).select("avatar username fullname email bio website");

  res.status(200).json({ success: true, data: user });
});
*/

const deleteUser = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.params.userId);

    return res.status(200).json({
      type: "success",
      message: "delete user data successfully",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};


/*
const follow = asyncHandler(async (req, res, next) => {
  // make sure the user exists
  const user = await User.findById(req.params.id);

  if (!user) {
    return next({
      message: `No user found for id ${req.params.id}`,
      statusCode: 404,
    });
  }

  // make the sure the user is not the logged in user
  if (req.params.id === req.user.id) {
    return next({ message: "You can't unfollow/follow yourself", status: 400 });
  }

  // only follow if the user is not following already
  if (user.followers.includes(req.user.id)) {
    return next({ message: "You are already following him", status: 400 });
  }

  await User.findByIdAndUpdate(req.params.id, {
    $push: { followers: req.user.id },
    $inc: { followersCount: 1 },
  });
  await User.findByIdAndUpdate(req.user.id, {
    $push: { following: req.params.id },
    $inc: { followingCount: 1 },
  });

  res.status(200).json({ success: true, data: {} });
});
*/

/*
const unfollow = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next({
      message: `No user found for ID ${req.params.id}`,
      statusCode: 404,
    });
  }

  // make the sure the user is not the logged in user
  if (req.params.id === req.user.id) {
    return next({ message: "You can't follow/unfollow yourself", status: 400 });
  }

  await User.findByIdAndUpdate(req.params.id, {
    $pull: { followers: req.user.id },
    $inc: { followersCount: -1 },
  });
  await User.findByIdAndUpdate(req.user.id, {
    $pull: { following: req.params.id },
    $inc: { followingCount: -1 },
  });

  res.status(200).json({ success: true, data: {} });
});
*/

/*
const feed = asyncHandler(async (req, res, next) => {
  const following = req.user.following;

  const users = await User.find()
    .where("_id")
    .in(following.concat([req.user.id]))
    .exec();

  const postIds = users.map((user) => user.posts).flat();

  const posts = await Post.find()
    .populate({
      path: "comments",
      select: "text",
      populate: { path: "user", select: "avatar fullname username" },
    })
    .populate({ path: "user", select: "avatar fullname username" })
    .sort("-createdAt")
    .where("_id")
    .in(postIds)
    .lean()
    .exec();

  posts.forEach((post) => {
    // is the loggedin user liked the post
    post.isLiked = false;
    const likes = post.likes.map((like) => like.toString());
    if (likes.includes(req.user.id)) {
      post.isLiked = true;
    }

    // is the loggedin saved this post
    post.isSaved = false;
    const savedPosts = req.user.savedPosts.map((post) => post.toString());
    if (savedPosts.includes(post._id)) {
      post.isSaved = true;
    }

    // is the post belongs to the loggedin user
    post.isMine = false;
    if (post.user._id.toString() === req.user.id) {
      post.isMine = true;
    }

    // is the comment belongs to the loggedin user
    post.comments.map((comment) => {
      comment.isCommentMine = false;
      if (comment.user._id.toString() === req.user.id) {
        comment.isCommentMine = true;
      }
    });
  });

  res.status(200).json({ success: true, data: posts });
});
*/


// Relationship
router.use("/relationship", require("./relationship"));

// Survey
router.use("/survey", require("./survey"));

router.use("/html-profile", require("./htmlProfile").htmlProfileRouter);




router.get("/", getAllUsers);
router.get("/:userId", getUserById);
router.put("/:userId", checkAuth, editUser);
router.delete("/:userId", checkAuth, deleteUser);

router.put("/:userId/follow", checkAuth, followUser);
router.put("/:userId/unfollow", checkAuth, unFollowuser);


// welcome popout completed
router.post('/welcome-done', authenticate(), require('./welcomeDone'));


// Update
router.patch("/",
  authenticate(true),
  userPolicy.updateUser,
  require("./userUpdate")
);


// block user
router.post("/block",
  authenticate(),
  require("./blockUser")
);

// unblock user
router.delete("/block",
  authenticate(),
  require("./unblockUser")
);

// User agreeing to the TOS and the privacy policy
router.post("/agreeingPolicies",
  authenticate(false),
  require("./agreeingPolicies")
);

// Details
router.get("/:user_id?",
authenticate(true), 
require("./userDetails"));

/* auth login moved
// Register
router.post("/register",
  authPolicy.register,
  rateLimit({name: 'register', expire: 600, requestsLimit: 5, useIP: true, nextIfInvalid: true }),
  // show captcha 
  forceCaptcha,
  reCaptchaPolicy,
  require("./register")
);

// confirm email
router.post("/register/confirm",
  authPolicy.confirm,
  require("./confirmEmail")
);

// Login
router.post("/login",
  authPolicy.login,
  rateLimit({name: 'login', expire: 600, requestsLimit: 5, useIP: true, nextIfInvalid: true }),
  reCaptchaPolicy,
  require("./login")
);

// delete my account
router.delete("/delete-account",
  authenticate(),
  require("./deleteAccount")
);

// Reset password request
router.post("/reset/request",
  authPolicy.resetRequest,
  rateLimit({name: 'reset_password', expire: 600, requestsLimit: 5, useIP: true, nextIfInvalid: true }),
  reCaptchaPolicy,
  require("./resetRequest")
);

// Reset password
router.post("/reset/code/:code",
  authPolicy.reset,
  require("./reset")
);

// Logout
router.delete("/logout",
  authenticate(true),
  require("./logout")
);
*/

export default router;
