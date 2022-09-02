const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../model/user.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');

router.post('/signup', (req, res, next) => {
    bcrypt.hash(req.body.password, 10, (err, hash) => {
        if (err) {
            return res.status(500).json({ error: err })
        } else {
            const user = new User({
                _id: new mongoose.Types.ObjectId,
                name: req.body.name,
                password: hash,
                email_id: req.body.email_id,
                user_name: req.body.user_name,
                gender: req.body.gender,
                mobile: req.body.mobile
            })
            user.save()
                .then(result => {
                    res.status(200).json({
                        new_user: result
                    })
                })
                .catch(err => {
                    res.status(500).json({
                        error: err
                    })
                })
        }
    })

})

router.post('/login', (req, res, next) => {
    User.find({ user_name: req.body.user_name })
        .exec()
        .then(user => {
            if (user.length < 0) {
                return res.status(401).json({
                    msg: "user not exit"
                })
            } else {
                bcrypt.compare(req.body.password, user[0].password, (err, result) => {
                    if (!result) {
                        return res.status(401).json({ msg: "incorrect password" })
                    } if (result) {
                        const token = jwt.sign({
                            user_name: user[0].user_name,
                            // userType: user[0].userType,
                            email_id: user[0].email_id,
                            mobile: user[0].mobile
                        },
                            'this is dummy text',
                            { expiresIn: "24h" }
                        )
                        res.status(200).json({
                            username: user[0].user_name,
                            email: user[0].email_id,
                            token: token
                        })
                    }
                })
            }
        })
        .catch(err => {
            res.status(500).json({ error: err })
        })
})

//update user
router.put('/:id', auth, async (req, res, next) => {
    if (req.body.id == req.params.id) {
        if (req.body.password) {
            try {
                const salt = await bcrypt.genSalt(10);
                req.body.password = await bcrypt.hash(req.body.password, salt);
            }
            catch (err) {
                return res.status(500).json({ error: err })
            }
        }
        try {
            const user = await User.findByIdAndUpdate(req.params.id, { $set: req.body, });
            res.status(200).json("Account has been updated")
        } catch (err) {
            return res.status(500).json({ error: err })
        }

    } else {
        return res.status(403).json("You can update only your account!")
    }
})
//delete user
router.delete('/:id', auth, async (req, res, next) => {
    if (req.body.id == req.params.id) {

        try {
            await User.findByIdAndDelete(req.params.id);
            res.status(200).json("Account has been deleted successfully")
        } catch (err) {
            return res.status(500).json(err)
        }

    } else {
        return res.status(403).json("You can Delete only your account!")
    }
})
//get a user
router.get("/:id", auth, async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        const { password, updatedAt, ...other } = user._doc;
        res.status(200).json(other);
    }
    catch (err) {
        return res.status(500).json(err)
    }
})
//follow a user
router.put("/:id/follow", auth, async (req, res, next) => {
    if (req.body.idToFollow !== req.params.id) {
        try {
            const user = await User.findById(req.params.id);
            const currentUser = await User.findById(req.body.idToFollow);
            if (!user.followers.includes(req.body.idToFollow)) {
                await user.updateOne({ $push: { followers: req.body.idToFollow } });
                await currentUser.updateOne({ $push: { followings: req.params.id } });
                res.status(200).json("user has been followed");
            } else {
                return res.status(403).json("You already follow")
            }
        } catch (err) {
            return res.status(500).json(err)
        }
    } else {
        res.status(403).json("You can't follow yourself")
    }
})
//unfollow a user
router.put("/:id/unfollow", auth, async (req, res, next) => {
    if (req.body.idToUnFollow !== req.params.id) {
        try {
            const user = await User.findById(req.params.id);
            const currentUser = await User.findById(req.body.idToUnFollow);
            if (user.followers.includes(req.body.idToUnFollow)) {
                await user.updateOne({ $pull: { followers: req.body.idToUnFollow } });
                await currentUser.updateOne({ $pull: { followings: req.params.id } });
                res.status(200).json("user has been unfollowed");
            } else {
                return res.status(403).json("You are not following this user")
            }
        } catch (err) {
            return res.status(500).json(err)
        }
    } else {
        res.status(403).json("You can't unfollow yourself")
    }
})
//block a user
router.put("/:id/block", auth, async (req, res, next) => {
    if (req.body.idToBlock !== req.params.id) {
        try {
            const user = await User.findById(req.params.id);
            const currentUser = await User.findById(req.body.idToBlock);
            if (!user.block.includes(req.body.idToBlock)) {
                await user.updateOne({ $push: { block: req.body.idToBlock } });
                await currentUser.updateOne({ $push: { blockedBy: req.params.id } });
                res.status(200).json("user has been blocked");
            } else {
                return res.status(403).json("User already blocked")
            }
        } catch (err) {
            return res.status(500).json(err)
        }
    } else {
        res.status(403).json("You can't block yourself")
    }
})
//unblock a user
router.put("/:id/unblock", auth, async (req, res, next) => {
    if (req.body.idToUnblock !== req.params.id) {
        try {
            const user = await User.findById(req.params.id);
            const currentUser = await User.findById(req.body.idToUnblock);
            if (user.block.includes(req.body.idToUnblock)) {
                await user.updateOne({ $pull: { block: req.body.idToUnblock } });
                await currentUser.updateOne({ $pull: { blockedBy: req.params.id } });
                res.status(200).json("user has been unblocked");
            } else {
                return res.status(403).json("this user is not blocked")
            }
        } catch (err) {
            return res.status(500).json(err)
        }
    } else {
        res.status(403).json("you cant block/unblock yourself")
    }
})


//Profile api
router.get("/:id/profile", auth, async (req, res, next) => {
    try {
        const user = await User.findById(req.body.user_id);
        if (user.blockedBy.includes(req.params.id) || user.block.includes(req.params.id)) {
            return res.status(403).json("You cant view this profile")
        } else if (user.isPublic == true || user.followers.includes(req.params.id)) {
            await User.aggregate([
                {
                    $match: { _id: new mongoose.Types.ObjectId(req.body.user_id) }
                },
                {
                    $lookup:
                    {
                        from: "posts",
                        localField: "_id",
                        foreignField: "user_id",
                        as: "posts"
                    }
                }], function (err, result) {
                    if (err) {
                        return res.status(500).json(err)
                    } else {
                        console.log("RESult", result)
                        return res.status(200).json({
                            name: result[0].name,
                            gender: result[0].gender,
                            mobile: result[0].mobile,
                            followers: result[0].followers.length,
                            followings: result[0].followings.length,
                            postCount: result[0].posts.length,
                            publicProfile: result[0].isPublic,
                        })
                    }
                })
        } else {
            return res.status(403).json("Private Profile")
        }
    }
    catch (err) {
        return res.status(500).json(err)
    }
})

module.exports = router;