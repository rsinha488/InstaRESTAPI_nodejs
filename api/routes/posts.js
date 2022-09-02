const express = require('express');
const router = express.Router();
const Post = require('../model/posts.model');
const User = require('../model/user.model');
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: 'restful-api',
    api_key: '572366663591521',
    api_secret: 'v1JX2RzJbjdOGp-fyzES66PIKtk'
    ,
    secure: true
});
//create a post
router.post("/", async (req, res) => {

    if (req.files.media) {
        const file = req.files.media;
        cloudinary.uploader.upload(file.tempFilePath, async (err, result) => {
            if (err) {
                res.status(500).json(err)
            } else {
                const newPost = new Post(
                    {
                        user_id: req.body.user_id,
                        description: req.body.description ? req.body.description : '',
                        media: result.url,
                        publicPost: req.body.publicPost ? req.body.publicPost : false
                    }
                );
                try {
                    const savedPost = await newPost.save();
                    res.status(200).json(savedPost);
                } catch (err) {
                    res.status(500).json(err);
                }
            }
        })
    } else {
        const newPost = new Post(req.body);
        try {
            const savedPost = await newPost.save();
            res.status(200).json(savedPost);
        } catch (err) {
            res.status(500).json(err);
        }
    }

});

//update a post 
router.put("/:id", auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        console.log("post ", post.user_id, req.body.user_id)
        if (post.user_id == req.body.user_id) {
            await post.updateOne({ $set: req.body });
            res.status(200).json("post updated successfully");
        } else {
            res.status(403).json("you can update only your post");
        }
    } catch (err) {
        res.status(500).json(err);
    }
});


//delete a post

router.delete("/:id", auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (post.user_id === req.body.user_id) {
            await post.deleteOne();
            res.status(200).json("post deleted successfully");
        } else {
            res.status(403).json("you can delete only your post");
        }
    } catch (err) {
        res.status(500).json(err);
    }
});
//like or unlike a post
router.put("/:id/like", auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post.likes.includes(req.body.user_id)) {
            await post.updateOne({ $push: { likes: req.body.user_id } });
            res.status(200).json("you liked the post");
        } else {
            await post.updateOne({ $pull: { likes: req.body.user_id } });
            res.status(200).json("you disliked");
        }
    } catch (err) {
        res.status(500).json(err);
    }
});
// //get a post

router.get("/:id", auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        res.status(200).json(post);
    } catch (err) {
        res.status(500).json(err);
    }
});

//get timeline post 
router.get("/timeline/all", auth, async (req, res) => {
    console.log("TIMELINE")
    try {
        const currentUser = await User.findById(req.body.user_id);
        console.log("currentUser", currentUser);
        const userPosts = await Post.find({ user_id: currentUser._id });
        console.log("userPosts", userPosts);
        const friendPosts = await Promise.all(
            currentUser.followings.map((friendId) => {
                return Post.find({ user_id: friendId });
            })
        );
        console.log("friendPosts", friendPosts);
        res.json(userPosts.concat(...friendPosts))
    } catch (err) {
        res.status(500).json(err);
    }
});

//comment on a Post
router.put("/comment/:id", auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        // console.log("post ", post.user_id, req.body.user_id)
        await post.updateOne({ $push: { comments: req.body.comments } });
        res.status(200).json("your comment has been posted");
    } catch (err) {
        res.status(500).json(err);
    }
});
//Tag a friend
router.put("/tag/:id/:postId", auth, async (req, res) => {
    try {
        const currentUser = await User.findById(req.params.id);
        const post = await Post.findById(req.params.postId);
        if (currentUser.followings.includes(req.body.user_id) && currentUser.followers.includes(req.body.user_id)) {
            await post.updateOne({ $push: { tags: req.body.user_id } });
            res.status(200).json("User got tagged to your post");
        } else {
            res.status(403).json("You both are not following each other ");
        }
    } catch (err) {
        res.status(500).json(err);
    }
});
// list public posts
router.get("/:id/public", auth, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        let blockedIds = [];
        user.block.map((data) => {
            console.log("new ObjectId(data)", new mongoose.Types.ObjectId(data))
            blockedIds.push(new mongoose.Types.ObjectId(data))
        });
        user.blockedBy.map((data) => {
            blockedIds.push(new mongoose.Types.ObjectId(data))
        })
        console.log(blockedIds)
        const post = await Post.find(
            { user_id: { $nin: blockedIds }, publicPost: true }
        ).sort({ updatedAt: -1 });
        res.status(200).json(post);
    } catch (err) {
        res.status(500).json(err);
    }
})

module.exports = router;