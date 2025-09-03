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
        const user = await loginUser(savedUsername, savedPassword);
        if (user) {
          navigateToDashboard(user);
        } else {
          console.error("Invalid saved credentials");
          localStorage.removeItem('username');
          localStorage.removeItem('password');
        }
      } catch (err) {
        console.error("Error during auto-login:", err);
        localStorage.removeItem('username');
        localStorage.removeItem('password');
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
      try {
        const user = await loginUser(username, password);
        if (user) {
          // Save credentials locally
          localStorage.setItem('username', username);
          localStorage.setItem('password', password);
          navigateToDashboard(user);
        } else {
          setError("Invalid username or password");
        }
      } catch (error) {
        console.error("Error logging in", error);
        setError("Error logging in. Please try again.");
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
