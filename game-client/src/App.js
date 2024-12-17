import './App.css';
import React, { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

function App() {
  const [id, setId] = useState("");
  const [gameState, setGameState] = useState({
    question: "Ожидание игроков",
    activePlayer: -1,
    players: new Map(),
    status: ""
  });
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected");
      socket.emit("join", "Ilya");
    });

    socket.on("assignId", (assignedId) => {
      setId(assignedId);
      console.log(`Assigned id: ${assignedId}`);
    });

    socket.on("gameState", (newGameState) => {
      setGameState(newGameState);
      console.log(newGameState);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from server");
    });

    return () => {
      socket.off("connect");
      socket.off("assignId");
      socket.off("gameState");
      socket.off("disconnect");
    };
  }, []); 


  return (
    <div className="app-container">
      <header className="app-header">
        <p className="logo">
          TeamSoul
        </p>
      </header>
      <div className="game-parent">
        <div className="game-container">
          <div className="game-header">
            <Button variant="outlined">Выйти из игры</Button>
            <p className="room-number-label">Комната 111</p>
            <Button variant="outlined">Правила</Button>
          </div>
          <div className="question-parent">
            <div className="question-container">
              <p className="question-label">
                {gameState.question}
              </p>
            </div>
          </div>
          <div className="user-list-parent">
            <List component={Stack} direction="row" sx={{ width: '100%', bgcolor: 'background.paper' }}>
              {[0, 1, 2, 3].map((value) => {
                const labelId = `checkbox-list-secondary-label-${value}`;
                return (
                  <ListItem key={value} disablePadding >
                    <ListItemButton>
                      <ListItemAvatar>
                        <Avatar>
                          H
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText id={labelId} primary={`Item ${value + 1}`} />
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
