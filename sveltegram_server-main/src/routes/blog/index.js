const blog = require('../../models/Blog');
const User = require('../../models/user');

let JSON_SECRET_KEY = "dsadsadsad"

import express from "express";
const router = express.Router();


import comment from "./comment"
import posts from "./posts"
import tags from "./tags"


//router.use("/comment", comment)
//router.use("/posts", posts)
//router.use("/tags", tags)






//get curr user
router.get('/curruser', async (req, res) => {

    let user = await User.findById(req.user._id).lean().exec();
    return res.status(200).json({ user });
})

//get  users
router.get('', async (req, res) => {

    let users = await User.aggregate([{ $sort : { followers : -1} }]).limit(5).exec();
    return res.status(200).json({ users });
})


//userdetails
router.post('/userdetail', async (req, res) => {

    const user = req.user;

    User.findById(user._id, function (err, payload) {
        if (err)
            return res.status(403).send({ message: err._message });
        payload.interests = req.body.interests;
        payload.save(function (err) {
            if (err)
                return res.status(403).send({ message: err._message })
            else
                return res.status(201).send({ status: 'success' })
        })


    })


})

router.post('/follow/:follow_id/', (req, res) => {

    User.findById(req.params.follow_id, function (err, followedUser) {
        if (err)
            return res.status(404).json({ status: 'failed', message: "user not found" });

        followedUser.followers.push(req.user._id);
        followedUser.save(function (err) {
            if (err)
                return res.status(404).json({ status: 'failed', message: "user not found" });
            User.findById(req.user._id, function (err, followingUser) {
                followingUser.following.push(followedUser._id);
                followingUser.save(function (err) {
                    if (err)
                        return res.status(404).json({ status: 'failed', message: "user not found" });
                    else
                        return res.status(200).json({ status: 'success', user: followingUser });
                })
            })
        })

    })
})



router.post('/unfollow/:unfollow_id/', (req, res) => {

    User.findById(req.params.unfollow_id, function (err, followedUser) {
        if (err)
            return res.status(404).json({ status: 'failed', message: "user not found" });
        followedUser.followers = followedUser.followers.filter(id => (id !== null && id.toString() !== req.user._id.toString()));


        followedUser.save(function (err) {
            if (err)
                return res.status(404).json({ status: 'failed', message: "user not found" });
            User.findById(req.user._id, function (err, followingUser) {

                followingUser.following = followingUser.following.filter(id => (id !== null && id.toString() !== followedUser._id.toString()));

                followingUser.save(function (err) {
                    if (err)
                        return res.status(404).json({ status: 'failed', message: "user not found" });
                    else
                        return res.status(200).json({ status: 'success', user: followingUser });
                })
            })
        })

    })
})


router.post('/like/:post_id', async (req, res) => {
    blog.findById(req.params.post_id, function (err, blog) {
        if (err)
            return res.status(404).json({ status: 'failed', message: "post not found" });
        blog.likedby.push(req.user._id);
        blog.save(function (err) {
            if (err)
                return res.status(404).json({ status: 'failed', message: "post not updated" });
            User.findById(req.user._id, function (err, user) {
                if (err)
                    return res.status(404).json({ status: 'failed', message: "user not found" });
                user.likes.push(req.params.post_id);
                user.save(function (err) {
                    if (err)
                        return res.status(404).json({ status: 'failed', message: "user not updated" });
                    else
                        return res.status(200).json({ status: 'success', user })
                })
            })
        })
    })
})


router.post('/unlike/:post_id', async (req, res) => {
    blog.findById(req.params.post_id, function (err, blog) {
        if (err)
            return res.status(404).json({ status: 'failed', message: "post not found" });
        blog.likedby = blog.likedby.filter(id => (id !== null && id.toString() !== req.user._id.toString()));

        blog.save(function (err) {
            if (err)
                return res.status(404).json({ status: 'failed', message: "post not updated" });
            User.findById(req.user._id, function (err, user) {
                if (err)
                    return res.status(404).json({ status: 'failed', message: "user not found" });
                user.likes = user.likes.filter(id => (id !== null && id.toString() !== req.params.post_id.toString()));

                user.save(function (err) {
                    if (err)
                        return res.status(404).json({ status: 'failed', message: "user not updated" });
                    else
                        return res.status(200).json({ status: 'success', user })
                })
            })
        })
    })
})


export default router;