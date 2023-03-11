const express = require("express");
const { default: mongoose } = require("mongoose");
const router = express.Router();
const User = mongoose.model("User");
const bcrypt = require("bcrypt");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
let path = require("path");

//change password

router.post("/change_password", async (req, res) => {
  const { oldpassword, newpassword, email } = req.body;

  if (!oldpassword || !newpassword || !email) {
    res.status(422).json({ error: "please fill all the feilds" });
  } else {
    try {
      const savedUser = await User.findOne({ email: email });
      if (savedUser) {
        const encrpytedpass = savedUser.password;
        const isMatched = await bcrypt.compare(oldpassword, encrpytedpass);
        console.log(isMatched);
        if (isMatched) {
          savedUser.password = newpassword;
          await savedUser.save();
          res.status(200).json({ msg: "password changed" });
        } else {
          res.status(422).json({ error: "old password is wrong" });
        }
      } else {
        res.status(422).json({ error: "Invalid credentials" });
      }
    } catch (error) {
      res.status(422).json({ error: error });
    }
  }
});

// change bio

router.post("/add_bio", async (req, res) => {
  const { id, bio } = req.body;

  if (!id) {
    res.status(422).json({ error: "something went wrong" });
  } else {
    try {
      const savedUser = await User.findById(id);
      if (savedUser) {
        savedUser.bio = bio;
        await savedUser.save();
        res.status(200).json({ msg: "New bio added" });
      } else {
        res.status(422).json({ error: "server error" });
      }
    } catch (error) {
      res.status(200).json({ error });
    }
  }
});

//change username

router.post("/change_username", async (req, res) => {
  const { username, id } = req.body;
  if (!username) {
    res.status(422).json({ error: "please fill all the feilds" });
  } else {
    const usernameAvailable = await User.find({ username });
    // console.log(usernameAvailable);
    if (!usernameAvailable.length > 0) {
      const savedUser = await User.findById(id);
      // console.log(savedUser);
      if (savedUser) {
        savedUser.username = username;
        await savedUser.save();
        res.status(200).json({ msg: "username changed" });
        // console.log(savedUser);
      } else {
        res.status(422).json({ error: "server error" });
      }
    } else {
      res.status(422).json({ error: "username already exist" });
    }
  }
});

// multer upload

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "Images/ProfilePics");
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

let upload = multer({ storage, fileFilter });

// chnage profile pic

router.route("/change_dp").post(upload.single("photo"), async (req, res) => {
  const { id } = req.body;
  const photo = req.file ? req.file.filename : "";
  // console.log(photo);
  try {
    const updatePic = await User.findByIdAndUpdate(
      {
        _id: id,
      },
      { profilepic: photo }
    );

    if (updatePic.profilepic.length > 0) {
      fs.unlink("Images/ProfilePics/" + updatePic.profilepic, (err) => {
        if (err) {
          throw err;
        }
        // console.log("Delete File successfully.");
      });
    }
    // console.log(updatePic);
    res.status(200).json({ msg: "profile pic changed" });
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
