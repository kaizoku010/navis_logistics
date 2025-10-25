import React, { useEffect } from 'react';
import "./TruckOwnerDash.css"
import GuyBanner from '../components/GuyBanner';
import IconBox from '../components/IconBox';
import ActiveDeliveriesList from '../components/ActiveDeliveriesList';
import Graph from '../components/Graph';
import Search from '../components/Search';
import NewMap from './NewMap'; // Import NewMap
import { useAuth } from '../contexts/AuthContext';
import { useDatabase } from '../contexts/DatabaseContext';
import { useTruckOwnerTrucks } from '../contexts/TruckOwnerTruckContext'; // Import TruckOwnerTruckContext
import { useTruckOwnerDrivers } from '../contexts/TruckOwnerDriverContext'; // Import TruckOwnerDriverContext
import DriverIc from "../assets/drv.png"
import Trucks from  "../assets/vv.png"
import { Box, CircularProgress } from '@mui/material'; // Import Box and CircularProgress

function TruckOwnerDash() {
  const { user } = useAuth();
  const { nonUserDeliveries, deliveries } = useDatabase();
  const { companyTrucks, loadingCompanyTrucks } = useTruckOwnerTrucks();
  const { companyDrivers, loadingCompanyDrivers } = useTruckOwnerDrivers();



const getSortedDeliveriesByCompany = () => {
  if (!nonUserDeliveries || !user?.company) return [];
  return deliveries
    .filter(delivery => 
      delivery.acceptedBy?.toLowerCase() === user.company.toLowerCase() && 
      (delivery.status === "accepted" || delivery.status === "active")
    )
};



const getSortedDriversByCompany = () => {
  if (!companyDrivers || !user?.company) return [];
  return companyDrivers
    .filter(drivers => 
      drivers.company?.toLowerCase() === user.company.toLowerCase())
};



const getSortedtrucksByCompany = () => {
  if (!companyTrucks || !user?.company) return [];
  return companyTrucks
    .filter(trucks => 
      trucks.company?.toLowerCase() === user.company.toLowerCase()
    )
};

  // console.log("deliveries accepted: ", getSortedDeliveriesByCompany().length)

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

  const getActiveDeliveriesByCompany = () => {
  if (!deliveries || !user?.company) return [];
  return deliveries.filter(delivery => 
    delivery.company?.toLowerCase() === user.company.toLowerCase() &&
    (delivery.status === 'in_transit' || delivery.status === 'en_route')
  );
};

  const truckLocations = companyTrucks.map(truck => {
    if (truck.currentLatitude && truck.currentLongitude) {
      return {
        lat: truck.currentLatitude,
        lng: truck.currentLongitude,
        name: truck.numberPlate,
        imageUrl: Trucks // Using the Trucks asset for truck icon
      };
    }
    return null;
  }).filter(Boolean);

  const driverLocations = companyDrivers.map(driver => {
    if (driver.currentLatitude && driver.currentLongitude) {
      return {
        lat: driver.currentLatitude,
        lng: driver.currentLongitude,
        name: driver.name,
        imageUrl: driver.imageUrl
      };
    }
    return null;
  }).filter(Boolean);

  const activeDeliveries = getActiveDeliveriesByCompany();

  const mapRoutes = activeDeliveries.map(delivery => ({
    uid: delivery.id,
    originCoords: {
      lat: Number(delivery.pickupCoords.lat?.N || delivery.pickupCoords.lat),
      lng: Number(delivery.pickupCoords.lng?.N || delivery.pickupCoords.lng)
    },
    destinationCoords: {
      lat: Number(delivery.destinationCoords.lat?.N || delivery.destinationCoords.lat),
      lng: Number(delivery.destinationCoords.lng?.N || delivery.destinationCoords.lng)
    },
    truckId: delivery.truckId,
  }));


useEffect(() => {
  // fetchDeliveriesFromAPI(); // No longer needed if deliveries are fetched via context
}, []);

  //  console.log("TEST ", pendingDeliveriesCompany().length) 
  //  console.log("number of accepted requests: ", getSortedDeliveriesByCompany().length)

  const isLoading = loadingCompanyTrucks || loadingCompanyDrivers;

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

return <div className='truck-owner-dash-des'>

<div className='truck-owner-header truck-owner-card'>
<Search/>
<div className='truck-owner-name_user_image'>
  <div className='truck-owner-user_info_'>
   <p className='truck-owner-userName'>{user?.username}</p>
  <p className='truck-owner-userComp_'>{user?.company}</p>  

  </div>
 

  <img className='truck-owner-userImage' src={user?.imageUrl} alt="User profile" />
</div>
</div>
{/* others */}
<div className='truck-owner-top-content'>
<div className='truck-owner-div-left'>
  <GuyBanner company={user?.company}/>
  <Graph 
    xAxisData={[1, 2, 3, 4, 5, 6]}
    deliveriesData={[
      1,
      2,
      3,
      getSortedDeliveriesByCompany().length || 4,
      getSortedDeliveriesByCompany().length || 5,
      getSortedDeliveriesByCompany().length || 5
    ]}
    requestsData={[
      0,
      1,
      pendingDeliveriesCompany().length || 2,
      pendingDeliveriesCompany().length || 2,
      pendingDeliveriesCompany().length || 2,
      pendingDeliveriesCompany().length || 2
    ]}
  />

</div>
<div className='truck-owner-boxes'>
  <IconBox 
   iconClass="fi fi-rr-route" 
  number={getSortedDeliveriesByCompany().length} title={"Accepted Deliveries "}/>
  <IconBox
  iconClass="fi fi-rr-car-journey"
  number={pendingDeliveriesCompany().length} title={"Pending Deliveries"}/>
  <IconBox
  iconClass="fi fi-br-train-journey"
  number={completedDeliveriesByCompany().length} title={"Completed Deliveries"} />
  <IconBox
  iconClass="fi fi-sr-vote-nay"
  number={declinedDeliveriesByCompany().length} title={"Active Deliveries"}/>
<IconBox
iconClass="i fi-ss-driver-man"
backgroundImage={DriverIc} number={getSortedDriversByCompany().length} title={"Number Of Drivers"}/>
<IconBox
iconClass="fi fi-ss-shipping-fast"
backgroundImage={Trucks} number={getSortedtrucksByCompany().length} title={"Number of Trucks"}/>

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