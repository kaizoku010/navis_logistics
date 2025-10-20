import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDriverAuth } from '../contexts/DriverAuthContext'; // Import useDriverAuth
import Logo from "../assets/logo2.png";
import './logic.css';

function LoginDriver() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // Local loading state
  const { driverLogin, driver } = useDriverAuth(); // Use driverLogin from DriverAuthContext and get driver state
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
      // driverLogin will update the context, triggering the useEffect
      const success = await driverLogin(email, password);
      if (success) {
        navigate('/root/driver'); // Navigate to driver dashboard on successful login
      } else {
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
      <h2 style={{alignSelf: "anchor-center", marginBottom: "3rem", fontSize: "0.8rem"}}>Driver Login</h2>
     
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
     
          <div className='driver-btn-section'>
     
          <button style={{width:"fit-content"}} className='patricia driver-login-btn btn-login' type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        <button className='back_btn patricia' onClick={home} type="button">
            Back
          </button>
        </div>

      </form>
    </div>
  );
}

export default LoginDriver;