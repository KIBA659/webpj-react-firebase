import React from "react";
import { Link } from "react-router-dom";
import "./GamePage.css"; // Використовуємо правильний шлях до CSS

const games = [
  { id: 1, image: "/img/tic-tac.jpg", title: "Tic Tac Toe", description: "Класична гра Хрестики-Нулики", route: "/Tic-Tac-Toe-Game" },
  { id: 2, image: "/img/2048.jpg", title: "2048", description: "Гра 2048", route: "/2048" },
  { id: 3, image: "/img/Simon.jpg", title: "Simon", description: "Класична гра Simon", route: "/SimonGame" },
];

const GamePage = () => {
  return (
    <div className="game-page">
      <h1>Тут будуть мої ігри!</h1>
      <p>Тепер ви можете вибрати гру.</p>

      <div className="game-list">
        {games.map((game) => (
          <div key={game.id} className="game-card">
            <img src={game.image} alt={game.title} className="game-image" />
            <h2>{game.title}</h2>
            <p>{game.description}</p>
            <Link to={game.route}>
              <button>Грати</button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GamePage;
