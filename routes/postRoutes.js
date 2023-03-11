const express = require("express");
const { default: mongoose } = require("mongoose");
const router = express.Router();
const User = mongoose.model("User");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
let path = require("path");

// multer upload

const storageposts = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "Images/Posts");
  },
  filename: function (req, file, cb) {
    // console.log(file);
    cb(null, uuidv4() + "-" + Date.now() + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedFileTypes = ["image/jpeg", "image/jpg", "image/png"];
  if (allowedFileTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

let uploadposts = multer({ storage: storageposts, fileFilter });

// add post

router
  .route("/upload_post")
  .post(uploadposts.single("postimg"), async (req, res) => {
    const postimg = req.file ? req.file.filename : "";
    const { caption, location, id } = req.body;
    // console.log(caption, location, id);

    const newpost = {
      postimage: postimg,
      caption: caption,
      location: location,
      likes: [],
      comments: [],
    };

    try {
      const savedUser = await User.findById({ _id: id });
      if (savedUser) {
        if (postimg.length > 0) {
          savedUser.posts.push(newpost);
          await savedUser.save();
          res.status(200).json({ msg: "post added" });
        } else {
          res.status(422).json({ error: "image not found" });
        }
      } else {
        res.status(422).json({ error: "server error" });
      }
    } catch (error) {
      res.status(422).json({ error });
    }
  });

router.post("/get_posts", async (req, res) => {
  const { userid } = req.body;

  try {
    let myFollowing = [];
    const myUserData = await User.findById({ _id: userid });

    myUserData.following.map((item, index) => {
      return myFollowing.push(item.userid);
    });

    // console.log(myFollowing);

    let allPosts = [];
    const allUsers = await User.find({ _id: { $in: myFollowing } });
    allUsers.map((item, index) => {
      item.posts.map((post, index) => {
        return allPosts.push(post);
      });
    });

    res.status(200).json({ msg: "posts found", posts: allPosts });
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
