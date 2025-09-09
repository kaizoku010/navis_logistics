import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useDriverAuth } from '../contexts/DriverAuthContext'; // Import the driver auth hook
import "./root.css"
import { useNavigate } from "react-router-dom";

export default function Root() {
  const { user, logout } = useAuth();
  const { driver, driverLogout } = useDriverAuth(); // Get driver state and logout function
  const navigate = useNavigate();

  // Determine the current user, whether it's a regular user or a driver
  const currentUser = user || driver;

  const handleLogout = async () => {
    try {
      if (user) {
        await logout(); // Regular user logout
      }
      if (driver) {
        driverLogout(); // Driver logout
      }
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
            {/* Use currentUser to check accountType */}
            {(currentUser?.accountType === 'root') && (
              <>
                <li>
                  <Link to="/root/dashboard">Overview</Link>
                </li>
              </>
            )}

            {(currentUser?.accountType === 'cargo-mover') && (
              <>
                <li>
                  <Link to="/root/cargo-mover">Overview</Link>
                </li>
              </>
            )}

            {(currentUser?.accountType === 'cargo-mover' || currentUser?.accountType === 'root') && (
              <>
                <li>
                  <Link to="shipments">Shipments</Link>
                </li>
                <li>
                  <Link to="tracks">All Trucks</Link>
                </li>
              </>
            )}

            {(currentUser?.accountType === 'track-owner' || currentUser?.accountType === 'root') && (
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
                  <Link to="enroute">Deliveries Completed</Link>
                </li>
              </>
            )}

            {(currentUser?.accountType === 'root' || currentUser?.accountType === 'cargo-mover') && (
              <li>
                <Link to="map">Navis Map</Link>
              </li>
            )}

            {(currentUser?.accountType === 'driver' || currentUser?.accountType === 'root') && (
              <>
                <li>
                <Link to="/root/driver">Home</Link>
                </li>
                <li>
                <Link to="/root/driver/profile">Account</Link>
                </li>
              </>
            )}

            {/* This will now appear for any logged-in user */}
            {currentUser && (
              <li>
                <Link onClick={handleLogout}>Logout</Link>
              </li>
            )}
          </ul>
        </nav>
      </div>
      <div id="detail" className="content">
        <Outlet />
      </div>
    </>
  );
}
