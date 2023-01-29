import express from "express";
const router = express.Router();

import albumroute from "./album/index"
import assetroute from "./asset/index"



router.use("/album", albumroute);
router.use("/asset", assetroute)



//router.get("/", getAllPosts);
//router.get("/:postId", getPostById);

//router.delete("/:postId", deletePost);

//router.put("/:postId/like", likePost);
//router.put("/:postId/unlike", unLikePost);

























export default router;