// src/pages/Dashboard.js
import React from 'react';
import "./Dashboard.css"
import GuyBanner from '../components/GuyBanner';
import IconBox from '../components/IconBox';
import Graph from '../components/Graph';
import Search from '../components/Search';
import pp from "../assets/pp.jpg"
import { useAuth } from '../contexts/AuthContext';

function CargoMoverDash() {
  const { user } = useAuth();

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
  <IconBox/>
  <IconBox/>

</div>
<div className='div-right'>
  <IconBox
  iconClass="fi fi-sr-vote-nay"
  number={12} title={"Deliveries Declined"}/>
  <IconBox/>
</div>
<IconBox/>
<IconBox/>

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
