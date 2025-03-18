import React, { useState, useEffect } from 'react';
import './TicTacToeGame.css';
import { database, ref, set, get } from './firebase'; // Імпортуємо Firebase
import { getAuth, onAuthStateChanged } from "firebase/auth"; // Додаємо Auth

const TicTacToeGame = () => {
  const [playerTurn, setPlayerTurn] = useState('x');
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isGameOver, setIsGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [stats, setStats] = useState({ wins: 0, draws: 0, losses: 0 });
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        await loadUserStats(user.uid); // Завантажуємо статистику після авторизації
      } else {
        setUserId(null);
        setStats({ wins: 0, draws: 0, losses: 0 });
      }
    });
  }, []);

  // Функція для завантаження статистики
  const loadUserStats = async (uid) => {
    const statsRef = ref(database, `users/${uid}/Tic-Tac-Toe-Game-Stats`);
    try {
      const snapshot = await get(statsRef);
      if (snapshot.exists()) {
        setStats(snapshot.val()); // Встановлюємо статистику в state
      } else {
        // Якщо статистика ще не існує, ініціалізуємо її
        setStats({ wins: 0, draws: 0, losses: 0 });
      }
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const checkWinner = (board) => {
    const winPatterns = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6],
    ];

    for (let pattern of winPatterns) {
      const [a, b, c] = pattern;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a]; // Повертаємо переможця ('x' або 'o')
      }
    }
    return null;
  };

  const handleClick = (index) => {
    if (board[index] || isGameOver || !userId) return;

    const newBoard = [...board];
    newBoard[index] = playerTurn;
    setBoard(newBoard);

    const winner = checkWinner(newBoard);

    if (winner) {
      setWinner(winner);
      setIsGameOver(true);
      updateStats(winner);
    } else if (newBoard.every(cell => cell !== null)) {
      setIsGameOver(true);
      updateStats(null);
    } else {
      setPlayerTurn((prev) => (prev === 'x' ? 'o' : 'x'));
    }
  };

  const updateStats = (winner) => {
    if (!userId) return;

    const newStats = { ...stats };
    if (winner === 'x') {
      newStats.wins += 1;
    } else if (winner === 'o') {
      newStats.losses += 1;
    } else {
      newStats.draws += 1;
    }

    // Оновлюємо статистику у Firebase
    const statsRef = ref(database, `users/${userId}/Tic-Tac-Toe-Game-Stats`);
    set(statsRef, newStats)
      .then(() => setStats(newStats)) // Оновлюємо локальну статистику
      .catch(error => console.error("Error updating stats:", error));
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setPlayerTurn('x');
    setIsGameOver(false);
    setWinner(null);
  };

  return (
    <div className="tic-tac-toe-game">
      <h1>Tic-Tac-Toe Game</h1>
      {userId ? (
        <>
          <p className="current-player">Current Player: {playerTurn.toUpperCase()}</p>
          <div className="tic-tac-toe-game-stats">
            <p>Wins: {stats.wins}, </p>
            <p>Draws: {stats.draws}, </p>
            <p>Losses: {stats.losses}.</p>
          </div>
          <div className="board">
            {board.map((cell, index) => (
              <div
                key={index}
                className="cell"
                onClick={() => handleClick(index)}
              >
                {cell}
              </div>
            ))}
          </div>
          {isGameOver && (
            <div className="game-over">
              <h2>
                {winner ? `Player ${winner.toUpperCase()} Wins!` : "It's a Draw!"}
              </h2>
              <button onClick={resetGame}>Play Again</button>
            </div>
          )}
        </>
      ) : (
        <p>Please log in to track your stats.</p>
      )}
    </div>
  );
};

export default TicTacToeGame;
