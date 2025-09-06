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
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, Typography, Button, Stack } from '@mui/material';

// Helper function to get the start of the week (Sunday)
const getStartOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay(); // 0 for Sunday, 1 for Monday, etc.
  const diff = d.getDate() - day; // Adjust to Sunday
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

// Helper function to aggregate data weekly
const aggregateDataWeekly = (data, companyId) => {
  console.log("aggregateDataWeekly - Input data:", data);
  console.log("aggregateDataWeekly - companyId:", companyId);
  const weeklyCounts = {};
  data.forEach(item => {
    console.log("Processing item:", item);
    // Ensure item.date is valid before processing
    if (!item.date || isNaN(new Date(item.date).getTime())) {
      console.warn("Invalid date for item:", item);
      return; // Skip item if date is invalid
    }

    if (item.company === companyId) {
      console.log("Item company matches companyId:", item.company);
      const weekStart = getStartOfWeek(item.date);
      console.log("weekStart (local):", weekStart);

      // Construct weekKey using local date components
      const year = weekStart.getFullYear();
      const month = (weekStart.getMonth() + 1).toString().padStart(2, '0');
      const day = weekStart.getDate().toString().padStart(2, '0');
      const weekKey = `${year}-${month}-${day}`; // YYYY-MM-DD format (local)
      console.log("weekKey (local):", weekKey);

      weeklyCounts[weekKey] = (weeklyCounts[weekKey] || 0) + 1;
      console.log("weeklyCounts after update:", weeklyCounts);
    } else {
      console.log("Item company does NOT match companyId:", item.company, companyId);
    }
  });

  const sortedWeeks = Object.keys(weeklyCounts).sort();
  let xAxisData = sortedWeeks.map(week => {
    const date = new Date(week); // This will parse the YYYY-MM-DD string as local time
    console.log("xAxisData - week:", week, "date (parsed local):", date);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  });
  let seriesData = sortedWeeks.map(week => weeklyCounts[week]);

  console.log("aggregateDataWeekly - Final xAxisData:", xAxisData);
  console.log("aggregateDataWeekly - Final seriesData:", seriesData);

  // If there's only one data point, pad both xAxisData and seriesData
  if (sortedWeeks.length === 1) {
    // Add a dummy point at the beginning for both xAxisData and seriesData
    // Calculate a date for the previous week for the dummy x-axis label
    const prevWeekDate = new Date(new Date(sortedWeeks[0]).getTime() - 7 * 24 * 60 * 60 * 1000);
    xAxisData = [`${prevWeekDate.getMonth() + 1}/${prevWeekDate.getDate()}`, xAxisData[0]];
    seriesData = [0, seriesData[0]]; // Pad with 0 for the previous week
  } else if (sortedWeeks.length === 0) {
    // If no data, return empty arrays
    return { xAxisData: [], seriesData: [] };
  }

  return { xAxisData, seriesData };
};

function CargoMoverDash() {
  const { user } = useAuth();
  const { deliveries, fetchDeliveriesFromAPI, nonUserDeliveries, fetchNonUserDeliveriesFromAPI } = useDatabase();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.company) { // Only fetch if user company is available
      fetchDeliveriesFromAPI();
      fetchNonUserDeliveriesFromAPI(); // Fetch non-user deliveries as well
    }
  }, [user?.company]); // Re-fetch if user company changes

  const cargoMoverDeliveries = deliveries.filter(
    (delivery) => delivery.company === user?.company
  );

  const totalShipments = cargoMoverDeliveries.length;
  const pendingShipments = cargoMoverDeliveries.filter(d => d.status === 'pending').length;
  const activeShipments = cargoMoverDeliveries.filter(d => d.status === 'assigned' || d.status === 'in_transit').length;
  const completedShipments = cargoMoverDeliveries.filter(d => d.status === 'delivered').length;

  // Prepare data for the Graph component
  const { xAxisData: deliveriesXAxis, seriesData: deliveriesSeries } = aggregateDataWeekly(cargoMoverDeliveries, user?.company);
  const { xAxisData: requestsXAxis, seriesData: requestsSeries } = aggregateDataWeekly(nonUserDeliveries, user?.company);

  // Ensure xAxisData is consistent for both series, or handle separately in Graph component
  // For simplicity, let's use deliveriesXAxis for both, assuming dates will largely overlap
  const graphXAxisData = deliveriesXAxis;
  const graphDeliveriesData = deliveriesSeries;
  const graphRequestsData = requestsSeries;

  console.log("Graph Data - xAxisData:", graphXAxisData);
  console.log("Graph Data - deliveriesData:", graphDeliveriesData);
  console.log("Graph Data - requestsData:", graphRequestsData);

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
  <Graph xAxisData={graphXAxisData} deliveriesData={graphDeliveriesData} requestsData={graphRequestsData}/>
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
<Card sx={{ minWidth: 275, mt: 2 }}>
  <CardContent>
    <Typography variant="h6" component="div">
      Shipment Overview
    </Typography>
    <Typography sx={{ mb: 1.5 }} color="text.secondary">
      You have {activeShipments} active shipments and {pendingShipments} pending.
    </Typography>
    <Stack direction="row" spacing={1}>
      <Button variant="contained" onClick={() => navigate('/shipments')}>
        View All Shipments
      </Button>
      <Button variant="outlined" onClick={() => alert('Add New Shipment functionality to be implemented.')}>
        Add New Shipment
      </Button>
    </Stack>
  </CardContent>
</Card>
</div>
</div>


  </div>;
}

export default CargoMoverDash;
