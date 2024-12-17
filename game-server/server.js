const express = require("express");
const http = require("http");
const cors = require("cors");
const serverSocketIO = require("socket.io");
const clientSocket = require("socket.io-client");

const app = express();
const server = http.createServer(app);
const gameSocket = serverSocketIO(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});
const port = 5000;
const roomServiceSocket = clientSocket(process.env.WEBSOCKET_URL);

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

roomServiceSocket.on("connect", () => {
  console.log("Connected to toom service");
  socket.emit("getRoom");
});
roomServiceSocket.on("room", (room) => {
  console.log(`Room: ${room}`);
  
});
roomServiceSocket.on("disconnect", () => {
  console.log("Disconnected from server");
});

gameSocket.on("connection", (socket) => {
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
    gameSocket.emit("gameState", gameState);
    console.log(gameState);
  });

  socket.on("chooseActivePlayer", (id) => {
    gameState.activePlayer = id;
    gameState.question = getQuestion();
    gameSocket.emit("gameState", gameState);
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

app.use(cors());
server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});