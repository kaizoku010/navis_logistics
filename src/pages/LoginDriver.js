import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDriverAuth } from '../contexts/DriverAuthContext'; // Import useDriverAuth
import './logic.css';

function LoginDriver() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // Local loading state
  const { driverLogin } = useDriverAuth(); // Use driverLogin from DriverAuthContext
  const navigate = useNavigate();

  const handleLogin = async (e) => { // Make handleLogin async
    e.preventDefault();
    setError(''); // Clear previous errors

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true); // Set local loading state to true
    try {
      const success = await driverLogin(email, password);
      if (success) {
        console.log("Login successful!");
        navigate('/root/driver'); // Navigate to driver dashboard on success
      } else {
        console.log("Login failed. Invalid credentials.");
        setError('Invalid email or password');
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || 'An unexpected error occurred.');
    }
    setLoading(false); // Set local loading state to false after attempt
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