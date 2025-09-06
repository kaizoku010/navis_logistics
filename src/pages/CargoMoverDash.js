// src/pages/Dashboard.js
import React from 'react';
import "./Dashboard.css"
import GuyBanner from '../components/GuyBanner';
import IconBox from '../components/IconBox';
import Graph from '../components/Graph';
import Search from '../components/Search';
import pp from "../assets/pp.jpg"
import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useDatabase } from '../contexts/DatabaseContext';

function CargoMoverDash() {
  const { user } = useAuth();
  const { deliveries, fetchDeliveriesFromAPI } = useDatabase();

  useEffect(() => {
    if (user?.company) { // Only fetch if user company is available
      fetchDeliveriesFromAPI();
    }
  }, [user?.company]); // Re-fetch if user company changes

  const cargoMoverDeliveries = deliveries.filter(
    (delivery) => delivery.company === user?.company
  );

  const totalShipments = cargoMoverDeliveries.length;
  const pendingShipments = cargoMoverDeliveries.filter(d => d.status === 'pending').length;
  const activeShipments = cargoMoverDeliveries.filter(d => d.status === 'assigned' || d.status === 'in_transit').length;
  const completedShipments = cargoMoverDeliveries.filter(d => d.status === 'delivered').length;

  return <div className='dash-des'>

<div className='header card'>
<Search/>
<div className='name_user_image'>
  <div className='cargo-mover-data'>
   <p className='c_userName'>{user?.username}</p>
  <p className='c_userComp'>{user?.company}</p>  
  <p className='c_userComp'>{user?.accountType}</p>  

  </div>
 

  <img className='userImage' src={user?.imageUrl} alt="User profile" />
</div>
</div>
{/* others */}
<div className='top-content'>
<div className='div-left'>
  <GuyBanner company={user?.company} link="shipments"/>
  <Graph/>
</div>
<div className='boxes'>
<div className='div-right'>
  <IconBox
    iconClass="fi fi-sr-check-circle"
    number={totalShipments}
    title={"Total Shipments"}
  />
  <IconBox
    iconClass="fi fi-sr-hourglass-end"
    number={pendingShipments}
    title={"Pending Shipments"}
  />
</div>
<div className='div-right'>
  <IconBox
    iconClass="fi fi-sr-shipping-fast"
    number={activeShipments}
    title={"Active Shipments"}
  />
  <IconBox
    iconClass="fi fi-sr-check-circle"
    number={completedShipments}
    title={"Completed Shipments"}
  />
</div>

</div>
</div>
<div className='lower_dash card'> 

  <div className='lower_div_element'></div>
  <div className='lower_div_element'></div>
  <div className='lower_div_element'></div>

</div>

  </div>;
}

export default CargoMoverDash;
