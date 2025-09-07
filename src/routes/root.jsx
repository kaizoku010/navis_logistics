import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import "./root.css"
import { useNavigate } from "react-router-dom";

export default function Root() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

const handleLogout = async () => {
  try {
    await logout();
    navigate("/login");
  } catch (error) {
    console.error("Failed to log out", error);
  }
};

  return (
    <>
      <div id="sidebar">
        <h1>Navis Central Dashboard</h1>
        <div>
          <form id="search-form" role="search">
            <input
              id="q"
              aria-label="Search contacts"
              placeholder="Search"
              type="search"
              name="q"
            />
            <div id="search-spinner" aria-hidden hidden={true} />
            <div className="sr-only" aria-live="polite"></div>
          </form>
          <form method="post">
            <button >New</button>
          </form>
        </div>
        <nav>
          <ul>
          {(user?.accountType === 'root') && (
              <>
                  <li>
              <Link to="/root/dashboard">Overview</Link>
            </li>
             
              </>
            )}

         {(user?.accountType === 'cargo-mover') && (
              <>
                  <li>
              <Link to="/root/cargo-mover">Overview</Link>
            </li>
             
              </>
            )}
       
           
            {(user?.accountType === 'cargo-mover' || user?.accountType === 'root') && (
              <>
                <li>
                  <Link to="shipments">Shipments</Link>
                </li>
                <li>
                  <Link to="tracks">All Trucks</Link>
                </li>
              </>
            )}
            
            {(user?.accountType === 'track-owner' || user?.accountType === 'root') && (
              <>
                  <li>
              <Link to="/root/trucker">Overview</Link>
            </li>
                <li>
                  <Link to="drivers">Drivers</Link>
                </li>
                <li>
                <Link to="truck-management">Fleet</Link>
                </li>
                <li>
              <Link to="requests">Pending Deliveries </Link>
            </li>
           
            <li>
              <Link to="enroute">Deliveries Enroute</Link>
            </li>
         
              </>
              
            )}
             <li>
              <Link to="map">Navis Map</Link>
            </li>

            <li>
              <Link onClick={handleLogout}>Logout</Link>
            </li>
          </ul>
        </nav>
      </div>
      <div id="detail" className="content">
        <Outlet />
      </div>
    </>
  );
}
