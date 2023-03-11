const mongoose = require("mongoose");

const messageSchema = mongoose.Schema(
  {
    senderid: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    roomid: {
      type: String,
      required: true,
    },
    receiverid: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

mongoose.model("Message", messageSchema);
