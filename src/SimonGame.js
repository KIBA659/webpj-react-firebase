import React, { useState, useEffect, useRef } from 'react';
import { getAuth } from 'firebase/auth';
import { getDatabase, ref, set, get } from 'firebase/database';
import './SimonGame.css';

const colorObj = {
  color1: { current: '#006400', new: '#00ff00' },
  color2: { current: '#800000', new: '#ff0000' },
  color3: { current: '#0000b8', new: '#0000ff' },
  color4: { current: '#808000', new: '#ffff00' },
};

const getRandomColor = () => {
  const colorKeys = Object.keys(colorObj);
  return colorKeys[Math.floor(Math.random() * colorKeys.length)];
};

const delay = (time) => new Promise((resolve) => setTimeout(resolve, time));

const Game = () => {
  const auth = getAuth();
  const db = getDatabase();
  const [randomColors, setRandomColors] = useState([]);
  const [userSequence, setUserSequence] = useState([]);
  const [isPathGenerating, setIsPathGenerating] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);

  // Use refs to directly access the color divs
  const colorRefs = useRef({
    color1: null,
    color2: null,
    color3: null,
    color4: null,
  });

  // Fetch high score for the user from Firebase Realtime Database
  useEffect(() => {
    const fetchHighScore = async () => {
      const user = auth.currentUser;
      if (!user) return; // Вийти, якщо користувач не авторизований

      const userRef = ref(db, `users/${user.uid}/simonGameStats/highScore`);

      try {
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          setHighScore(snapshot.val());
        }
      } catch (error) {
        console.error('Помилка при отриманні рекорду:', error);
      }
    };

    fetchHighScore();
  }, [auth, db]);

  // Save high score to Firebase Realtime Database if the new score is higher
  const saveHighScore = async (newScore) => {
    const user = auth.currentUser;
    if (!user) return; // Вийти, якщо користувач не авторизований

    const userRef = ref(db, `users/${user.uid}/simonGameStats/highScore`);

    try {
      const snapshot = await get(userRef);
      const currentHighScore = snapshot.exists() ? snapshot.val() : 0;

      if (newScore > currentHighScore) {
        setHighScore(newScore);
        await set(userRef, newScore);
      }
    } catch (error) {
      console.error('Помилка при збереженні рекорду:', error);
    }
  };

  // Generate a random color path for the game sequence
  const generateRandomPath = async () => {
    await delay(2000);
    setIsPathGenerating(true);
    const newColor = getRandomColor();
    const updatedColors = [...randomColors, newColor];
    setRandomColors(updatedColors);

    // Show the generated sequence with animations
    for (let i = 0; i < updatedColors.length; i++) {
      const color = updatedColors[i];
      const colorRef = colorRefs.current[color];

      if (colorRef) {
        colorRef.style.backgroundColor = colorObj[color].new; // Show new color
        await delay(700); // Adjusted delay for better animation timing
        colorRef.style.backgroundColor = colorObj[color].current; // Reset to current color
        await delay(700); // Adjusted delay for better animation timing
      }
    }

    setIsPathGenerating(false);
  };

  // Handle user clicking on a color
  const handleColorClick = async (color) => {
    if (isPathGenerating || isGameOver) return;

    const newUserSequence = [...userSequence, color];
    setUserSequence(newUserSequence);

    const colorRef = colorRefs.current[color];
    if (colorRef) {
      colorRef.style.backgroundColor = colorObj[color].new; // Set the clicked color to its 'new' color

      // Reset the color after a short delay
      setTimeout(() => {
        colorRef.style.backgroundColor = colorObj[color].current;
      }, 200); // Remove after 200ms
    }

    // Check if the color clicked is correct
    if (newUserSequence[newUserSequence.length - 1] === randomColors[newUserSequence.length - 1]) {
      // If user has completed the sequence
      if (newUserSequence.length === randomColors.length) {
        setUserSequence([]);
        setScore(score + 1);
        generateRandomPath();
      }
    } else {
      // Game over, save score and reset sequence
      saveHighScore(score);
      setIsGameOver(true);
      setRandomColors([]); // Reset the sequence to start with 0 colors
    }
  };

  // Start a new game with the sequence starting at length 1
  const startNewGame = () => {
    setIsGameOver(false);
    setScore(0);
    setRandomColors([getRandomColor()]); // Start with 1 color
    setUserSequence([]);
    generateRandomPath();
  };

  return (
    <div className="game-wrapper">
      <div className="score">
        Score: {score} | High Score: {highScore}
      </div>
      <div className="game">
        {Object.keys(colorObj).map((color) => (
          <div
            key={color}
            ref={(el) => (colorRefs.current[color] = el)} // Assign the ref here
            className={`colors ${color}`}
            onClick={() => handleColorClick(color)}
            style={{ backgroundColor: colorObj[color].current }} // Initial color
          ></div>
        ))}
      </div>
      {isGameOver ? (
        <div>
          <p>Game Over! Your score: {score}</p>
          <button className="start-btn" onClick={startNewGame}>Restart Game</button>
        </div>
      ) : (
        <button className="start-btn" onClick={startNewGame}>Start New Game</button>
      )}
    </div>
  );
};

export default Game;
