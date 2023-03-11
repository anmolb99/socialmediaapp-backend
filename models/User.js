const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchemema = mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  profilepic: {
    type: String,
    default: "",
  },
  posts: {
    type: Array,
    default: [],
  },
  followers: {
    type: Array,
    default: [],
  },
  following: {
    type: Array,
    default: [],
  },
  bio: {
    type: String,
    default: "",
  },
  mymessages: {
    type: Array,
    default: [],
  },
});

userSchemema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 8);
    next();
  } else {
    return next();
  }
});

mongoose.model("User", userSchemema);
