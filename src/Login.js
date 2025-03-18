import React, { useState } from 'react';
import { auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from './firebase';
import { useNavigate } from 'react-router-dom'; // імпортуємо useNavigate
import './Login.css'; // Додано імпорт CSS файлу

const Login = ({ user, setUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isNewUser, setIsNewUser] = useState(true);
  const navigate = useNavigate(); // ініціалізуємо useNavigate

  const handleLogin = async () => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      setUser(result.user);
      navigate('/GamePage'); // перенаправляємо після успішного входу
    } catch (error) {
      console.error(error);
    }
  };

  const handleRegister = async () => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      setUser(result.user);
      navigate('/GamePage'); // перенаправляємо після реєстрації
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
  };

  return (
    <div className="login-container">
      <div className="login-box">
        {user ? (
          <>
            <p>Вітаємо, {user.displayName}!</p>
            <button onClick={handleLogout}>Вийти</button>
          </>
        ) : (
          <div>
            {isNewUser ? (
              <div>
                <h2>Реєстрація</h2>
                <input
                  type="email"
                  placeholder="Введіть email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <input
                  type="password"
                  placeholder="Введіть пароль"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button onClick={handleRegister}>Зареєструватися</button>
                <p>
                  Вже є акаунт?{' '}
                  <button onClick={() => setIsNewUser(false)}>Увійти</button>
                </p>
              </div>
            ) : (
              <div>
                <h2>Вхід</h2>
                <input
                  type="email"
                  placeholder="Введіть email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <input
                  type="password"
                  placeholder="Введіть пароль"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button onClick={handleLogin}>Увійти</button>
                <p>
                  Немає акаунту?{' '}
                  <button onClick={() => setIsNewUser(true)}>Зареєструватися</button>
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
