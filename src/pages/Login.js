import React, { useState, useEffect } from 'react';
import Logo from "../assets/logo2.png";
import "./logic.css";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const { loading, login, user } = useAuth();
  const navigate = useNavigate();



    useEffect(() => {
        if (user) {
            navigateToDashboard(user);
        }
    }, [user]);


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
        case 'driver': // New case for driver
          navigate("/root/driver"); // Redirect to driver dashboard
          break;
        default:
          setError("Invalid account type");
      }
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      
      if (!email || !password) {
        setError("Please enter both email and password");
        return;
      }
      
      try {
        const user = await login(email, password);
        if (user) {
          navigateToDashboard(user);
        } else {
          setError("Invalid username or password. Please try again.");
        }
      } catch (error) {
        console.error("Error during login attempt:", error);
        if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
            setError("Invalid username or password. Please try again.");
        } else if (error.code === 'auth/network-request-failed') {
            setError("Network error: Unable to connect to the server. Please check your internet connection and try again.");
        }
        else {
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
        <p className='driver-login-link'>
          Are you a driver? <a href="/login-driver">Login here</a>
        </p>
      </form>
    </div>
  );
}

export default Login;
