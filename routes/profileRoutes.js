const express = require("express");
const { default: mongoose } = require("mongoose");
const router = express.Router();
const User = mongoose.model("User");
const jwt = require("jsonwebtoken");
const ObjectId = require("mongoose").ObjectId;

//my profile

router.get("/my_profile", async (req, res) => {
  const { authorization } = req.headers;
  if (!authorization) {
    res.status(422).json({ error: "Please login again" });
  } else {
    const token = authorization.replace("Bearer ", "");
    try {
      const tokendata = await jwt.verify(token, process.env.JWT_SECRET_KEY);
      const savedUser = await User.findById(tokendata._id);

      if (savedUser) {
        res
          .status(200)
          .json({ msg: "logged in successfully", user: savedUser });
      } else {
        res.status(422).json({ error: "server error" });
      }
    } catch (error) {
      res.status(422).json({ error: error });
    }
  }
});

// user profile

router.post("/user_profile", async (req, res) => {
  const { id } = req.body;
  // console.log(req.body);

  try {
    const savedUser = await User.findById(id);
    if (savedUser) {
      res.status(200).json({ msg: "user fetched", user: savedUser });
    } else {
      res.status(422).json({ error: "server error" });
    }
  } catch (error) {
    res.status(422).json({ error: error });
  }
});

router.post("/searchuser", async (req, res) => {
  const { keyword } = req.body;
  if (!keyword) {
    res.status(422).json({ error: "No users found" });
  } else {
    try {
      const users = await User.find({
        username: { $regex: keyword, $options: "i" },
      });

      if (users.length == 0) {
        res.status(422).json({ error: "No users found" });
      } else {
        let newlist = [];
        users.map((item) => {
          newlist.push({
            id: item._id,
            profilepic: item.profilepic,
            username: item.username,
          });
        });
        res.status(200).json({ msg: "user found", users: newlist });
      }
    } catch (error) {
      res.status(422).json({ error });
    }
  }
});

router.post("/add_follower", async (req, res) => {
  const { userid, follid, username, profilepic } = req.body;
  // console.log(userid, follid, username, profilepic);
  try {
    if (!userid || !follid || !username || !profilepic) {
      res.status(422).json({ error: "login again" });
    } else {
      const follExist = await User.findOne({
        _id: userid,
        followers: {
          $elemMatch: {
            follid: follid,
          },
        },
      });

      // console.log(follExist);

      if (follExist) {
        res.status(422).json({ error: "follower already exist" });
      } else {
        //add follower to user followers

        const savedFollower = await User.findById(userid);
        const followerdata = {
          follid,
          username,
          profilepic,
        };
        savedFollower.followers.push(followerdata);
        await savedFollower.save();

        //add following to my following

        const saveFollowing = await User.findById(follid);
        const followingdata = {
          userid: userid,
          username: savedFollower.username,
          profilepic: savedFollower.profilepic,
        };
        saveFollowing.following.push(followingdata);
        await saveFollowing.save();

        res.status(200).json({ msg: "followed" });
      }
    }
  } catch (error) {
    res.status(422).json({ error });
  }
});

router.post("/remove_follower", async (req, res) => {
  const { follid, userid } = req.body;
  // console.log(follid, userid);
  try {
    const follExist = await User.findOne({
      _id: userid,
      followers: {
        $elemMatch: { follid: follid },
      },
    });

    // console.log(follExist);

    if (follExist) {
      // remove follower from user followers

      const rmvFollower = await User.findByIdAndUpdate(
        { _id: follExist._id },
        {
          $pull: { followers: { follid: follid } },
        }
      );

      // remove follow from my following

      const rmvFollowing = await User.findByIdAndUpdate(
        { _id: follid },
        {
          $pull: { following: { userid: follExist._id.toString() } },
        }
      );

      res.status(200).json({ msg: "unfollowed" });
    } else {
      res.status(422).json({ error: "user not exist" });
    }
  } catch (error) {
    console.log(error);
    res.status(422).json({ error });
  }
});

module.exports = router;
