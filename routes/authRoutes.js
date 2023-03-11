const express = require("express");
const { default: mongoose } = require("mongoose");
const router = express.Router();
const User = mongoose.model("User");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

async function Mailer(recieverEmail, code) {
  // let testAccount = await nodemailer.createTestAccount();
  // console.log(code);

  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.NODEMAIL_EMAIL, // generated ethereal user
      pass: process.env.NODEMAIL_PASSWORD, // generated ethereal password
    },
  });

  let info = await transporter.sendMail({
    from: "UNKNOWN", // sender address
    to: recieverEmail, // list of receivers
    subject: "Email Verification", // Subject line
    text: `Your verification code is ${code}`, // plain text body
    html: `<b>Your verification code is ${code}</b>`, // html body
  });

  console.log("Message sent: %s", info.messageId);
}

// sign up

router.post("/signup_verify_email", async (req, res) => {
  const { email } = req.body;
  console.log(email);
  if (!email) {
    res.status(422).json({ error: "please fill all the feilds" });
  } else {
    const savedUser = await User.findOne({ email: email });
    if (savedUser) {
      res.status(422).json({ error: "Email already exist" });
    } else {
      try {
        const verificationCode = Math.floor(100000 + Math.random() * 900000);
        await Mailer(email, verificationCode);
        res.status(200).json({ msg: "code sent", email, verificationCode });
      } catch (error) {
        res.status(422).json({ error: "error sending code " + error });
      }
    }
  }
});

router.post("/signup", async (req, res) => {
  const { email, username, password } = req.body;
  // console.log(email, username, password);
  if (!email || !username || !password) {
    res.status(422).json({ error: "please fill all the feilds" });
  } else {
    try {
      const user = new User({
        email: email,
        username: username,
        password: password,
      });
      await user.save();
      res.status(200).json({ msg: "user registered" });
    } catch (error) {
      res.status(422).json({ error });
    }
  }
});

router.post("/username_available", async (req, res) => {
  const { username } = req.body;
  if (!username) {
    res.status(422).json({ error: "Please fill all the feilds" });
  } else {
    try {
      const usernameExist = await User.findOne({ username: username });
      // console.log(usernameExist);
      if (usernameExist !== null) {
        res.status(422).json({ error: "username exists" });
      } else {
        res.status(200).json({ msg: "username availabe" });
      }
    } catch (error) {
      res.status(422).json({ error });
    }
  }
});

// forgot password

router.post("/fp_verify_email", async (req, res) => {
  const { email } = req.body;
  // console.log(email);
  if (!email) {
    res.status(422).json({ error: "please fill all the feilds" });
  } else {
    const savedUser = await User.findOne({ email: email });
    if (savedUser) {
      try {
        const verificationCode = Math.floor(100000 + Math.random() * 900000);
        await Mailer(email, verificationCode);
        res.status(200).json({ msg: "code sent", email, verificationCode });
      } catch (error) {
        res.status(422).json({ error: "error sending code " + error });
      }
    } else {
      res.status(422).json({ error: "Invalid credentials" });
    }
  }
});

router.post("/reset_password", async (req, res) => {
  const { email, password } = req.body;

  if (!password || !email) {
    res.status(422).json({ error: "please fill all the fields" });
  } else {
    try {
      const savedUser = await User.findOne({ email: email });
      if (savedUser) {
        savedUser.password = password;
        await savedUser.save();
        res.status(200).json({ msg: "password changed" });
      } else {
        res.status(422).json({ error: "Invalid credentials" });
      }
    } catch (error) {
      res.status(422).json({ error });
    }
  }
});

//log in

router.post("/signin", async (req, res) => {
  const { email, password } = req.body;

  console.log(email, password);

  if (!email || !password) {
    res.status(422).json({ error: "please fill all the fields" });
  } else {
    try {
      const savedUser = await User.findOne({ email, email });
      if (savedUser) {
        const isMatched = await bcrypt.compare(password, savedUser.password);
        if (isMatched) {
          const token = jwt.sign(
            { _id: savedUser._id },
            process.env.JWT_SECRET_KEY
          );
          const { _id, email, username, profilepic } = savedUser;

          res.status(200).json({
            msg: "signed in successfully",
            token,
            user: {
              id: _id,
              email: email,
              username: username,
              profilepic: profilepic,
            },
          });
        } else {
          res.status(422).json({ error: "Invalid credentials" });
        }
      } else {
        res.status(422).json({ error: "Invalid credentials" });
      }
    } catch (error) {
      res.status(422).json({ error });
    }
  }
});

module.exports = router;
