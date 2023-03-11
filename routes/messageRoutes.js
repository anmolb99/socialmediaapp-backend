const express = require("express");
const { default: mongoose } = require("mongoose");
const router = express.Router();
const Message = mongoose.model("Message");

router.post("/savemessagetodb", async (req, res) => {
  const { senderid, receiverid, roomid, message } = req.body;
  console.log(req.body);
  try {
    const newMessage = new Message({
      senderid,
      receiverid,
      roomid,
      message,
    });
    await newMessage.save();
    res.send("message saved");
  } catch (error) {
    console.log(error);
    res.status(422).json({ error: error });
  }
});

router.post("/getmessages", async (req, res) => {
  const { roomid } = req.body;

  try {
    const ourChat = await Message.find({ roomid: roomid });
    if (ourChat) {
      res.status(200).json({ msg: "chat found", ourChat });
    } else {
      res.status(422).json({ error: "server error", error });
    }
  } catch {
    console.log(error);
    res.status(422).json({ error: "error getting messages", error });
  }
});

module.exports = router;
