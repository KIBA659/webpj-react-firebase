import React, { useState, useEffect, useCallback } from 'react';
import { getAuth } from "firebase/auth";
import { getDatabase, ref, get, set } from "firebase/database";
import './Game2048.css';

const size = 4;

const Game2048 = () => {
    const [board, setBoard] = useState(Array(size).fill().map(() => Array(size).fill(0)));
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    
    const auth = getAuth();
    const user = auth.currentUser;
    const db = getDatabase();
    
    useEffect(() => {
        if (user) {
            const highScoreRef = ref(db, `users/${user.uid}/2048/highScore`);
            get(highScoreRef).then(snapshot => {
                if (snapshot.exists()) {
                    setHighScore(snapshot.val());
                }
            });
        }
    }, [user, db]);
    
    const updateScore = useCallback((value) => {
        setScore(prev => {
            const newScore = prev + value;
            if (newScore > highScore) {
                setHighScore(newScore);
                if (user) {
                    set(ref(db, `users/${user.uid}/2048/highScore`), newScore);
                }
            }
            return newScore;
        });
    }, [highScore, user, db]);
    
    const initializeGame = useCallback(() => {
        const newBoard = Array(size).fill().map(() => Array(size).fill(0));
        placeRandom(newBoard);
        placeRandom(newBoard);
        setBoard(newBoard);
        setScore(0);
        setGameOver(false);
    }, []);
    
    const placeRandom = (newBoard) => {
        const emptyCells = [];
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                if (newBoard[i][j] === 0) {
                    emptyCells.push({ x: i, y: j });
                }
            }
        }
        if (emptyCells.length > 0) {
            const { x, y } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            newBoard[x][y] = Math.random() < 0.9 ? 2 : 4;
        }
    };
    
    const move = useCallback((direction) => {
        let hasChanged = false;
        let newBoard = board.map(row => [...row]);
        
        const transform = (line, moveTowardsStart) => {
            let newLine = line.filter(cell => cell !== 0);
            if (!moveTowardsStart) newLine.reverse();
            for (let i = 0; i < newLine.length - 1; i++) {
                if (newLine[i] === newLine[i + 1]) {
                    newLine[i] *= 2;
                    updateScore(newLine[i]);
                    newLine.splice(i + 1, 1);
                }
            }
            while (newLine.length < size) {
                newLine.push(0);
            }
            if (!moveTowardsStart) newLine.reverse();
            return newLine;
        };

        if (direction === 'ArrowUp' || direction === 'ArrowDown') {
            for (let j = 0; j < size; j++) {
                const column = newBoard.map(row => row[j]);
                const newColumn = transform(column, direction === 'ArrowUp');
                for (let i = 0; i < size; i++) {
                    if (newBoard[i][j] !== newColumn[i]) hasChanged = true;
                    newBoard[i][j] = newColumn[i];
                }
            }
        } else {
            for (let i = 0; i < size; i++) {
                const newRow = transform(newBoard[i], direction === 'ArrowLeft');
                if (newBoard[i].join(',') !== newRow.join(',')) hasChanged = true;
                newBoard[i] = newRow;
            }
        }

        if (hasChanged) {
            placeRandom(newBoard);
            setBoard(newBoard);
        }
    }, [board, updateScore]);

    useEffect(() => {
        initializeGame();
    }, [initializeGame]);

    // Keyboard Event Listener
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
                move(event.key);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [move]);

    // Mobile Swipe Event Listener
    useEffect(() => {
        let touchStartX = 0;
        let touchStartY = 0;

        const handleTouchStart = (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        };

        const handleTouchMove = (e) => {
            const touchEndX = e.touches[0].clientX;
            const touchEndY = e.touches[0].clientY;

            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;

            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                if (deltaX > 50) {
                    move('ArrowRight');
                } else if (deltaX < -50) {
                    move('ArrowLeft');
                }
            } else {
                if (deltaY > 50) {
                    move('ArrowDown');
                } else if (deltaY < -50) {
                    move('ArrowUp');
                }
            }
        };

        window.addEventListener('touchstart', handleTouchStart);
        window.addEventListener('touchmove', handleTouchMove, { passive: false });

        return () => {
            window.removeEventListener('touchstart', handleTouchStart);
            window.removeEventListener('touchmove', handleTouchMove);
        };
    }, [move]);

    return (
        <div className="game-2048-container">
            <h1 className="Name2028">2048</h1>
            <div className="Score2048">Score: {score}</div>
            <div className="High-Score2048">High Score: {highScore}</div>
            <div className="grid">
                {board.map((row, i) => row.map((cell, j) => (
                    <div key={`${i}-${j}`} className={`grid-cell ${cell ? 'filled' : ''}`} data-value={cell}>
                        {cell || ''}
                    </div>
                )))}
            </div>
            {gameOver && <div className="game-over">Game Over!</div>}
            <button className='button-2048' onClick={initializeGame}>Restart</button>
        </div>
    );
};

export default Game2048;
