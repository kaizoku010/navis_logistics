import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAWS } from '../contexts/MongoContext';
import "./root.css"
import { useNavigate } from "react-router-dom";

export default function Root() {
  const { user } = useAWS();
  const navigate = useNavigate();

const logout = ()=>{
  localStorage.removeItem("username");
  localStorage.removeItem("password");
  navigate("/login"); 
}

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
              <Link to="map">Deliveries Enroute</Link>
            </li>
         
              </>
              
            )}
             <li>
              <Link to="map">Navis Map</Link>
            </li>

            <li>
              <Link onClick={logout}>Logout</Link>
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
