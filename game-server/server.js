require('dotenv').config();
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
var roomNumber = -1;
var gameState = {
  question: "",
  activePlayer: -1,
  players: [],
  idArray: [],
  status: "wait players"
};
function getQuestion() {
  return questions[questions.length * Math.random() | 0];
}
function getRandomPlayer() {
  return gameState.idArray[gameState.idArray.length * Math.random() | 0];
}


roomServiceSocket.on("connect", () => {
  console.log("Connected to room service");
  roomServiceSocket.emit("getRoom");
});
roomServiceSocket.on("room", (room) => {
  console.log(room);
  roomNumber = room.id;
  gameState.players = room.players;
});
roomServiceSocket.on("disconnect", () => {
  console.log("Disconnected from room service");
});


gameSocket.on("connection", (socket) => {
  console.log(`A user connected [${socket.id}]`);

  socket.on("join", () => {
    console.log(`Join request from ${socket.id}`);
    gameState.idArray.push(socket.id);
    if (gameState.players.length > 1) {
      gameState.status = "started"
      gameState.activePlayer = getRandomPlayer();
      gameState.question = getQuestion();
      roomServiceSocket.emit("gameStateUpdate", gameState.status);
    }
    var response = {
      id: socket.id,
      roomNumber: roomNumber,
    };
    socket.emit("joinAck", response);
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
    gameState.idArray = gameState.idArray.filter(e => e !== socket.id)
    gameState.players.splice(0, 1);
    if (gameState.players.length < 2) {
      gameState.status = "ended"
      roomServiceSocket.emit("gameStateUpdate", gameState.status);
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