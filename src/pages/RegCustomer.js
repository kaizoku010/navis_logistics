import React, { useState } from "react";
import Logo from "../assets/logo2.png";
import "./logic.css";
import "./reg.css";
import { useNavigate } from "react-router-dom";
import { useAWS } from '../contexts/MongoContext';
import { storage, ref, uploadBytes, getDownloadURL } from "../contexts/firebaseContext"; // Adjust the import path accordingly

function RegCustomer() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [company, setCompany] = useState('');
  const [accountType, setAccountType] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const { loading, registerUser } = useAWS();
  const navigate = useNavigate();

  const handleImageUpload = async (file) => {

    const sanitizedFileName = file.name.replace(/\s+/g, '_');
  
    // Create a reference with the sanitized file name
    const storageRef = ref(storage, `navis_user_images/${sanitizedFileName}`);

    // Upload the file
    await uploadBytes(storageRef, file);
  
    // Get the download URL
    const imageUrl = await getDownloadURL(storageRef);
  
    return imageUrl;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (imageFile || email) {
      try {
        const imageUrl = imageFile ? await handleImageUpload(imageFile) : "";
        console.log("image link", imageUrl)
        await registerUser(username, email, company, password, accountType, imageUrl);
        alert('User registered successfully');
        navigate('/');
      } catch (error) {
        console.error('Error registering user', error);
        alert('Error registering user');
      }
    } else {
      alert('Input error, please try again');
    }
  };

  const handleBackNavigation = (e) => {
    e.preventDefault();
    navigate("/login");
  };

  return (
    <div className="regHolder">
      <div className="loginHolder2">
        <img className="navis-logo2" src={Logo} alt="Logo"/>
        {loading && (
            <div className="loading">
              <div className="loading-bar">
                <div className="loading-bar-fill"></div>
              </div>
              <p>Please wait...</p>
            </div>
          )}
        <form className="navis-form2 card" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            className="nav-input"
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="email"
            placeholder="id@email.com"
            value={email}
            className="nav-input"
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            className="nav-input"
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            type="text"
            placeholder="Your Company Name"
            value={company}
            className="nav-input"
            onChange={(e) => setCompany(e.target.value)}
          />
          <select
            className="nav-input"
            value={accountType}
            onChange={(e) => setAccountType(e.target.value)}
          >
            <option value="">Choose Account Type</option>
            <option value="cargo-mover">Cargo Mover</option>
            <option value="track-owner">Track Owner</option>
          </select>
          <input
            type="file"
            className="nav-input"
            onChange={(e) => setImageFile(e.target.files[0])}
          />
          <div className="btns-login2">
            <button className="btn-login2 regBtn" type="submit" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
            <button
              className="btn-regesiter2"
              onClick={handleBackNavigation}
              type="button"
              disabled={loading}
            >
              Back
            </button>
          </div>
          <p className="termsConditions">
            By signing up on Navis.com using social accounts or login/register form,
            you are agreeing to our Terms & Conditions and Privacy Policy
          </p>
        </form>
      </div>
      <div className="regImage"></div>
    </div>
  );
}

export default RegCustomer;
