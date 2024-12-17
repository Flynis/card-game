import './App.css';
import React, { useState, useEffect } from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import { Avatar, Stack } from "@mui/material";
import { io } from "socket.io-client";
import { OutlinedButton } from './components/OutlinedButton';
import { QuestionBox } from './components/QuestionBox';

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
    <div className="app-box">
      <header className="app-header">
        <div className="logo-box">
          <p className="logo" style={{color: "black"}}>
            Team
          </p>
          <p className="logo" style={{color: "white"}}>
            Soul
          </p>
        </div>
      </header>
      <div className="game-parent">
        <div className="game-box">
          <div className="game-header">
            <OutlinedButton variant="outlined">Выйти из игры</OutlinedButton>
            <p className="room-number-label">Комната 111</p>
            <OutlinedButton variant="outlined">Правила</OutlinedButton>
          </div>
          <div className="question-parent">
            <QuestionBox 
              elevation={24} 
              sx={{
                position: 'absolute', 
                zIndex: '1', 
                margin: '1em 2em 0 0',
                background: "linear-gradient(150deg, #0142ba, #0073dd)",
              }}
            />
            <QuestionBox 
              elevation={12} 
              sx={{
                position: 'absolute', 
                zIndex: '2', 
                margin: '0.5em 1em 0 0',
                background: "linear-gradient(150deg, #0051e1, #0073dd)",
              }}
            />
            <QuestionBox 
              elevation={3} 
              sx={{
                position: 'absolute', 
                zIndex: '3',
                background: "linear-gradient(135deg, #0b65ff, #7ce1fe)",
              }}
            >
              <p className="question-label">
                {gameState.question}
              </p>
            </QuestionBox>
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
