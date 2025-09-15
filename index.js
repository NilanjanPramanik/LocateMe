const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const { v1: uuid } = require("uuid");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

//setting ejs
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

//handle socket
io.on("connection", (socket) => {
  socket.on("join-room", ({ roomId, name }) => {
    socket.join(roomId);
    socket.data.name = name;
    console.log(`${name + " - " + socket.id} joined room ${roomId}`);

    //Notify other in the room
    socket.to(roomId).emit("user-joined", {
      id: socket.id,
      name,
    });
  });

  socket.on("send-location", ({ roomId, latitude, longitude, name }) => {
    //Only broadcast inside the room
    io.to(roomId).emit("recieve-location", {
      id: socket.id,
      latitude,
      longitude,
      name: name || socket.data.name,
    });
  });

  socket.on("disconnecting", () => {
    const rooms = [...socket.rooms].filter((r) => r !== socket.id);
    rooms.forEach((roomId) => {
      io.to(roomId).emit("user-disconnected", socket.id);
    });
  });

  socket.on("disconnect", () => {
    console.log(`${socket.id} disconnected`);
  });

  // socket.on("disconnect", () => {
  //   const rooms = [...socket.rooms].filter((r) => r !== socket.id);
  //   rooms.forEach((roomId) => {
  //     io.to(roomId).emit("user-disconnected", socket.id);
  //   });
  // });
});

//routes
app.get("/", (req, res) => {
  res.redirect("/" + uuid());
});

app.get("/:roomId", (req, res) => {
  res.render("index", { roomId: req.params.roomId });
});

//start server
server.listen(3000, () =>
  console.log("Server is running on http://localhost:3000")
);
