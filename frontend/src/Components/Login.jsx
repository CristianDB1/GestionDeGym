import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../Service/api.js';
import { setUserSession, isAuthenticated } from '../Utils/auth.js';
import '../styles/Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Redireccionar si ya está autenticado
    if (isAuthenticated()) {
      navigate('/home');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await login(email, password);
      if (response) {
        setUserSession(response);
        navigate('/home');
      }
    } catch (err) {
      setError('Credenciales inválidas. Por favor, intente de nuevo.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-form-container">
        <div className="logo-container">
          {/* Opción 1: Un círculo con inicial */}
          <div className="logo">G</div>
          
          {/* Opción 2: Una imagen real (descomenta para usar) */}
          {/* <img src="/path/to/your/logo.png" alt="Gimnasio Logo" className="logo-img" /> */}
        </div>
        <h2>Sistema de Gestión de Gimnasio</h2>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Contraseña:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" className="login-button">Iniciar Sesión</button>
        </form>
      </div>
    </div>
  );
};

export default Login;