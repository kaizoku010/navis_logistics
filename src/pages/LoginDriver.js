import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDriverAuth } from '../contexts/DriverAuthContext'; // Import useDriverAuth
import Logo from "../assets/logo2.png";
import './logic.css';

function LoginDriver() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // Local loading state
  const { driverLogin } = useDriverAuth(); // Use driverLogin from DriverAuthContext
  const navigate = useNavigate();

  const home =()=>{
    navigate("/");
  
  }

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
    <div className='loginHolder'>
      <img className='navis-logo' src={Logo} alt="Logo" />
      <form className='navis-form' onSubmit={handleLogin}>
        <h2>Driver Login</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          className='nav-input'
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          className='nav-input'
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="error-message">{error}</p>}
        <div className='btns-login'>
          <button className='driver-login-btn btn-login' type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </div>
        <button className='back_btn' onClick={home} type="button">
            Back
          </button>
      </form>
    </div>
  );
}

export default LoginDriver;