const bodyParser = require("body-parser");
const express = require("express");
const port = 5000;
const socketport = 5001;
const app = express();

require("./db");
require("./models/User");
require("./models/Message");

app.use(express.static(__dirname + "/Images/ProfilePics"));
app.use(express.static(__dirname + "/Images/Posts"));

const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const postRoutes = require("./routes/postRoutes");
const editProfileRoutes = require("./routes/editProfileRoutes");
const messageRoutes = require("./routes/messageRoutes");

const { createServer } = require("http");
const { Server } = require("socket.io");
const httpServer = createServer();
const io = new Server(httpServer, {});

app.use(bodyParser.json());
app.use(authRoutes);
app.use(profileRoutes);
app.use(postRoutes);
app.use(editProfileRoutes);
app.use(messageRoutes);

app.get("/", (req, res) => {
  res.send("Hello world");
});

io.on("connection", (socket) => {
  console.log("USER CONNECTED - ", socket.id);

  socket.on("disconnect", () => {
    console.log("USER DISCONNECTED - ", socket.id);
  });

  socket.on("join_room", (data) => {
    console.log("USER WITH ID - ", socket.id, "JOIN ROOM - ", data.roomid);
    socket.join(data);
  });

  socket.on("send_message", (data) => {
    console.log("MESSAGE RECIEVED - ", data);
    io.emit("receive_message", data);
  });
});

httpServer.listen(socketport, () => {
  console.log("socket io server is running on port", socketport);
});

app.listen(port, () => {
  console.log("server is running on port", port);
});
