import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDatabase } from '../contexts/DatabaseContext';
import './logic.css';

function LoginDriver() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { drivers, loading } = useDatabase();
  console.log("Available drivers:", drivers);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    console.log("Attempting login with:", email, password);
    const driver = drivers.find(d => d.email === email && d.password === password);
    if (driver) {
      console.log("Login successful for driver:", driver);
      // For simplicity, storing driver info in local storage.
      // Consider a more secure method for a real application.
      localStorage.setItem('driver', JSON.stringify(driver));
      navigate('/root/driver');
    } else {
      console.log("Login failed. No matching driver found.");
      setError('Invalid email or password');
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleLogin} className="login-form">
        <h2>Driver Login</h2>
        {error && <p className="error">{error}</p>}
        <div className="input-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="input-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={loading}>{loading ? 'Loading...' : 'Login'}</button>
      </form>
    </div>
  );
}

export default LoginDriver;