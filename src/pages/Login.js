import React, { useState, useEffect } from 'react';
import Logo from "../assets/logo2.png";
import "./logic.css";
import { useNavigate } from 'react-router-dom';
import { useAWS } from '../contexts/MongoContext';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const { loading, loginUser } = useAWS();
  const navigate = useNavigate();



    useEffect(() => {
      const savedUsername = localStorage.getItem('username');
      const savedPassword = localStorage.getItem('password');
      if (savedUsername && savedPassword) {
        autoLogin(savedUsername, savedPassword);
      }
    }, []);


    const autoLogin = async (savedUsername, savedPassword) => {
      try {
        console.log("Attempting auto-login for user:", savedUsername);
        const user = await loginUser(savedUsername, savedPassword);
        if (user) {
          console.log("Auto-login successful, navigating to dashboard");
          navigateToDashboard(user);
        } else {
          console.error("Auto-login failed: Invalid saved credentials");
          localStorage.removeItem('username');
          localStorage.removeItem('password');
          setError("Auto-login failed. Please login manually.");
        }
      } catch (err) {
        console.error("Error during auto-login:", err);
        console.error("Auto-login error details:", {
          message: err.message,
          name: err.name,
          stack: err.stack
        });
        localStorage.removeItem('username');
        localStorage.removeItem('password');
        setError("Auto-login failed. Please login manually.");
      }
    };
  
    const navigateToDashboard = (user) => {
      switch (user.accountType) {
        case 'root':
          navigate("/root/dashboard");
          break;
        case 'cargo-mover':
          navigate("/root/cargo-mover");
          break;
        case 'track-owner':
          navigate("/root/trucker");
          break;
        default:
          setError("Invalid account type");
      }
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      console.log("Login form submitted for user:", username);
      
      if (!username || !password) {
        setError("Please enter both username and password");
        return;
      }
      
      try {
        const user = await loginUser(username, password);
        if (user) {
          console.log("Login successful, saving credentials and navigating to dashboard");
          // Save credentials locally
          localStorage.setItem('username', username);
          localStorage.setItem('password', password);
          navigateToDashboard(user);
        } else {
          console.error("Login failed: Invalid username or password");
          setError("Invalid username or password. Please try again.");
        }
      } catch (error) {
        console.error("Error during login attempt:", error);
        console.error("Login error details:", {
          message: error.message,
          name: error.name,
          stack: error.stack
        });
        
        // Provide more specific error messages
        if (error.message.includes('Network error')) {
          setError("Network error: Unable to connect to the server. Please check your internet connection and try again.");
        } else if (error.message.includes('Login failed')) {
          setError(`Login failed: ${error.message}`);
        } else {
          setError("Error logging in. Please try again later.");
        }
      }
    };

  const registerHandler = () => {
    navigate("/regesiter");
  };


  const home =()=>{
    navigate("/");
  
  }

  return (
    <div className='loginHolder'>
      <img className='navis-logo' src={Logo} alt="Logo" />
      <form className='navis-form' onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          className='nav-input'
          onChange={(e) => setUsername(e.target.value)}
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
          <button className='btn-login' type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
          <button className='btn-regesiter' onClick={registerHandler} type="button" disabled={loading}>
            Get Account
          </button>
        </div>
        <button className='back_btn' onClick={home} type="button">
            Back
          </button>
        <p className='termsConditions'>
          By signing in or signing up to Navis.com using social accounts or login/register form,
          you are agreeing to our Terms & Conditions and Privacy Policy
        </p>
      </form>
    </div>
  );
}

export default Login;
