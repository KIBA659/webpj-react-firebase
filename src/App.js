import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login'; // Це ваша сторінка реєстрації/логіну
import GamePage from './GamePage'; // Сторінка з іграми
import TicTacToeGame from './TicTacToeGame'
import Game2048 from './Game2048';
import SimonGame from './SimonGame';
const App = () => {
  const [user, setUser] = useState(null); // Стан для відстеження авторизації користувача (null — не авторизований)

  return (
    <Router>
      <Routes>
        {/* Якщо користувач не авторизований, показуємо сторінку Login */}
        <Route path="/" element={user ? <Navigate to="/game" /> : <Login setUser={setUser} />}/>
        {/* Якщо користувач авторизований, показуємо GamePage */}
        <Route path="/game" element={ <GamePage />} />
        <Route path="/Tic-Tac-Toe-Game" element={<TicTacToeGame/>}/>
        <Route path="/2048" element={<Game2048/>}/>
        <Route path="/SimonGame" element={<SimonGame/>}/>
        
        
      </Routes>
    </Router>
  );
};
export default App;

