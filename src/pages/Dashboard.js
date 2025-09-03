// src/pages/Dashboard.js
import React from 'react';
import "./Dashboard.css"
import GuyBanner from '../components/GuyBanner';
import IconBox from '../components/IconBox';
import Graph from '../components/Graph';
import Search from '../components/Search';
import pp from "../assets/pp.jpg"
import { useAWS } from '../contexts/awsContext';

function Dashboard() {
  const { user, logoutUser } = useAWS();

  return <div className='dash-des'>
<div className='header card'>
<Search/>
<div className='name_user_image'>
  <div className="user_info_">
   <p className='userName'>{user?.username}</p>
  <p className='userComp'>{user?.company}</p>  
  {/* <p className='userComp'>{user?.accountType}</p>   */}

  </div>
 

  <img className='userImage' src={user?.imageUrl} alt="User profile" />
</div>
</div>
{/* others */}
<div className='top-content'>
<div className='div-left'>
  <GuyBanner/>
  <Graph/>
</div>
<div className='boxes'>
<div className='div-right'>
  <IconBox/>
  <IconBox/>

</div>
<div className='div-right'>
  <IconBox/>
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

export default Dashboard;
