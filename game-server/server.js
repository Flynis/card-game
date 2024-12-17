const express = require("express");
const http = require("http");
const cors = require("cors");
const socketIO = require("socket.io");
const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});
const port = 5000;

var fs = require('fs');
var questions = fs.readFileSync('questions.txt').toString().split("\n");
console.log("Questions:");
for(i in questions) {
  console.log(questions[i]);
};
var gameState = {
  question: "",
  activePlayer: -1,
  players: new Map(),
  status: "wait players"
};
var idArray = [];
function getQuestion() {
  return questions[questions.length * Math.random() | 0];
}
function getRandomPlayer() {
  return idArray[idArray.length * Math.random() | 0];
}

app.use(cors());
app.get("/", (req, res) => {
  res.status(200).send("Card Game Server");
});

io.on("connection", (socket) => {
  console.log(`A user connected [${socket.id}]`);

  socket.on("join", (name) => {
    console.log(`Join request from ${socket.id}`);
    player = {
      name: name
    };
    gameState.players.set(socket.id, player);
    idArray.push(socket.id);
    if (gameState.players.size > 1) {
      gameState.status = "started"
      gameState.activePlayer = getRandomPlayer();
      gameState.question = getQuestion();
    }
    socket.emit("assignId", socket.id);
    io.emit("gameState", gameState);
    console.log(gameState);
  });

  socket.on("chooseActivePlayer", (id) => {
    gameState.activePlayer = id;
    gameState.question = getQuestion();
    io.emit("gameState", gameState);
    console.log(gameState);
  });

  socket.on("disconnect", () => {
    console.log(`User ${socket.id} disconnected`);
    idArray = idArray.filter(e => e !== socket.id)
    gameState.players.delete(socket.id);
    if (gameState.players.size < 2) {
      gameState.status = "ended"
    }
    if (gameState.activePlayer == socket.id) {
      gameState.activePlayer = getRandomPlayer();
      gameState.question = getQuestion();
    }
    console.log(gameState);
  });
});

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});