// src/pages/Dashboard.js
import React, { useEffect } from 'react';
import "./Dashboard.css"
import GuyBanner from '../components/GuyBanner';
import IconBox from '../components/IconBox';
import Graph from '../components/Graph';
import Search from '../components/Search';
// import pp from "../assets/pp.jpg"
import { useAuth } from '../contexts/AuthContext';
import { useDatabase } from '../contexts/DatabaseContext';
// import OrderStats from '../components/OrderStats';
// import IncomeStats from '../components/IncomeStats';
// import Transactions from '../components/Transactions';
import DriverIc from "../assets/drv.png"
import Trucks from  "../assets/vv.png"

function TruckOwnerDash() {
  const { user } = useAuth();
  const { trucks, drivers, nonUserDeliveries, deliveries, fetchDeliveriesFromAPI } = useDatabase();

const getSortedDeliveriesByCompany = () => {
  if (!nonUserDeliveries || !user?.company) return [];
  return deliveries
    .filter(delivery => 
      delivery.acceptedBy?.toLowerCase() === user.company.toLowerCase() && 
      (delivery.status === "accepted" || delivery.status === "active")
    )
};

  console.log("deliveries accepted: ", getSortedDeliveriesByCompany().length)

  const completedDeliveriesByCompany = () => {
    if (!nonUserDeliveries || !user?.company) return [];
    return nonUserDeliveries
      .filter(delivery => delivery.acceptedBy?.toLowerCase() === user.company.toLowerCase() && delivery.status ==="completed" )
      .sort((a, b) => a.company.localeCompare(b.company));
  };

  const declinedDeliveriesByCompany = () => {
    if (!nonUserDeliveries || !user?.company) return [];
    return nonUserDeliveries
      .filter(delivery => delivery.acceptedBy?.toLowerCase() === user.company.toLowerCase() && delivery.status ==="declined" )
      .sort((a, b) => a.company.localeCompare(b.company));
  };

  const pendingDeliveriesCompany = () => {
    if (!nonUserDeliveries || !user?.company) return [];
    // Pending deliveries might not have an 'acceptedBy' field yet, so we check the creator's company
    return deliveries
      .filter(delivery => delivery.status ==="pending" ) || 0
  };

    const pendingNonDeliveriesCompany = () => {
    if (!nonUserDeliveries || !user?.company) return [];
    // Pending deliveries might not have an 'acceptedBy' field yet, so we check the creator's company
    return deliveries
      .filter(delivery => delivery.company?.toLowerCase() === user.company.toLowerCase() && delivery.status ==="pending" ) || 0
  };


useEffect(() => {
  fetchDeliveriesFromAPI();
}, [fetchDeliveriesFromAPI]);

  //  console.log("TEST ", pendingDeliveriesCompany().length) 
  //  console.log("number of accepted requests: ", getSortedDeliveriesByCompany().length)


return <div className='dash-des'>

<div className='header card'>
<Search/>
<div className='name_user_image'>
  <div className='user_info_'>
   <p className='userName'>{user?.username}</p>
  <p className='userComp_'>{user?.company}</p>  

  </div>
 

  <img className='userImage' src={user?.imageUrl} alt="User profile" />
</div>
</div>
{/* others */}
<div className='top-content'>
<div className='div-left'>
  <GuyBanner company={user?.company}/>
  <Graph/>
</div>
<div className='boxes'>
<div className='div-right'>
  <IconBox 
   iconClass="fi fi-rr-route" 
  number={getSortedDeliveriesByCompany().length} title={"Accepted Deliveries "}/>
  <IconBox
  iconClass="fi fi-rr-car-journey"
  number={pendingDeliveriesCompany().length} title={"Pending Deliveries"}/>

</div>
<div className='div-right'>
  <IconBox
  iconClass="fi fi-br-train-journey"
  number={completedDeliveriesByCompany().length} title={"Completed Deliveries"} />
  <IconBox
  iconClass="fi fi-sr-vote-nay"
  number={declinedDeliveriesByCompany().length} title={"Active Deliveries"}/>
</div>
<IconBox
iconClass="i fi-ss-driver-man"
backgroundImage={DriverIc} number={drivers.length} title={"Number Of Drivers"}/>
<IconBox
iconClass="fi fi-ss-shipping-fast"
backgroundImage={Trucks} number={trucks.length} title={"Number of Trucks"}/>

</div>
</div>
{/* <div className='lower_dash card'> 

  <div className='lower_div_element'>
    <OrderStats/>
  </div>
  <div className='lower_div_element'>
  <IncomeStats/>

  </div>
  <div className='lower_div_element'>
<Transactions/>
  </div>
</div> */}

  </div>;
}

export default TruckOwnerDash;