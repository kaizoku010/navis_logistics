// src/pages/Dashboard.js
import React from 'react';
import "./Dashboard.css"
import GuyBanner from '../components/GuyBanner';
import IconBox from '../components/IconBox';
import Graph from '../components/Graph';
import Search from '../components/Search';
import pp from "../assets/pp.jpg"
import { useAWS} from '../contexts/MongoContext';
import OrderStats from '../components/OrderStats';
import IncomeStats from '../components/IncomeStats';
import Transactions from '../components/Transactions';
import DriverIc from "../assets/drv.png"
import Trucks from  "../assets/vv.png"

function TruckOwnerDash() {
  const { user,  trucks, drivers, non_user_requests  } = useAWS();

  const getSortedDeliveriesByCompany = () => {
    if (!non_user_requests || !user) return [];
    return non_user_requests
      .filter(delivery => delivery.company === user.company && delivery.status ==="accepted" )
      .sort((a, b) => a.company.localeCompare(b.company)); // Sort by company name if needed
  };



  const completedDeliveriesByCompany = () => {
    if (!non_user_requests || !user) return [];
    return non_user_requests
      .filter(delivery => delivery.company === user.company && delivery.status ==="completed" )
      .sort((a, b) => a.company.localeCompare(b.company)); // Sort by company name if needed
  };


  const declinedDeliveriesByCompany = () => {
    if (!non_user_requests || !user) return [];
    return non_user_requests
      .filter(delivery => delivery.company === user.company && delivery.status ==="declined" )
      .sort((a, b) => a.company.localeCompare(b.company)); // Sort by company name if needed
  };

  const pendingDeliveriesCompany = () => {
    if (!non_user_requests || !user) return [];
    return non_user_requests
      .filter(delivery => delivery.company === user.company && delivery.status ==="pennding" ) || 0
  };

  console.log("number of request: ", pendingDeliveriesCompany().length)
  // console.log("number of drivers: ", drivers.length)


return <div className='dash-des'>

<div className='header card'>
<Search/>
<div className='name_user_image'>
  <div className='user_info_'>
   <p className='userName'>{user?.username}</p>
  <p className='userComp'>{user?.company}</p>  
  {/* <p className='userComp'>{user?.accountType}</p>   */}

  </div>
 

  <img className='userImage' src={user?.imageUrl}/>
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
  number={declinedDeliveriesByCompany().length} title={"Deliveries Declined"}/>
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
