// src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import "./Dashboard.css"
import GuyBanner from '../components/GuyBanner';
import IconBox from '../components/IconBox';
import Graph from '../components/Graph';
import Search from '../components/Search';
import NewMap from './NewMap'; 
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
  const weeklyCounts = {};
  data.forEach(item => {
    if (!item.date || isNaN(new Date(item.date).getTime())) {
      return; // Skip item if date is invalid
    }

    if (item.company === companyId) {
      const weekStart = getStartOfWeek(item.date);
      const year = weekStart.getFullYear();
      const month = (weekStart.getMonth() + 1).toString().padStart(2, '0');
      const day = weekStart.getDate().toString().padStart(2, '0');
      const weekKey = `${year}-${month}-${day}`;
      weeklyCounts[weekKey] = (weeklyCounts[weekKey] || 0) + 1;
    }
  });

  const sortedWeeks = Object.keys(weeklyCounts).sort();
  let xAxisData = sortedWeeks.map(week => {
    const date = new Date(week);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  });
  let seriesData = sortedWeeks.map(week => weeklyCounts[week]);

  if (sortedWeeks.length === 1) {
    const prevWeekDate = new Date(new Date(sortedWeeks[0]).getTime() - 7 * 24 * 60 * 60 * 1000);
    xAxisData = [`${prevWeekDate.getMonth() + 1}/${prevWeekDate.getDate()}`, xAxisData[0]];
    seriesData = [0, seriesData[0]];
  } else if (sortedWeeks.length === 0) {
    return { xAxisData: [], seriesData: [] };
  }

  return { xAxisData, seriesData };
};

function CargoMoverDash() {
  const { user } = useAuth();
  const { deliveries, fetchDeliveriesFromAPI, nonUserDeliveries, fetchNonUserDeliveriesFromAPI, drivers, fetchDriversFromAPI } = useDatabase();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.company) {
      fetchDeliveriesFromAPI();
      fetchNonUserDeliveriesFromAPI();
      fetchDriversFromAPI();
    }
  }, [user?.company, fetchDeliveriesFromAPI, fetchNonUserDeliveriesFromAPI, fetchDriversFromAPI]);

  const cargoMoverDeliveries = deliveries.filter(
    (delivery) => delivery.company === user?.company
  );

  const activeDeliveries = cargoMoverDeliveries.filter(d => d.status === 'assigned' || d.status === 'in_transit');

  const driverLocations = activeDeliveries.map(delivery => {
    const driver = drivers.find(d => d.id === delivery.driverId);
    if (driver && driver.currentLatitude && driver.currentLongitude) {
      return {
        lat: driver.currentLatitude,
        lng: driver.currentLongitude,
        name: driver.name,
        imageUrl: driver.imageUrl
      };
    }
    return null;
  }).filter(Boolean);

  const totalShipments = cargoMoverDeliveries.length;
  const pendingShipments = cargoMoverDeliveries.filter(d => d.status === 'pending').length;
  const completedShipments = cargoMoverDeliveries.filter(d => d.status === 'delivered').length;

  const { xAxisData: deliveriesXAxis, seriesData: deliveriesSeries } = aggregateDataWeekly(cargoMoverDeliveries, user?.company);
  const { xAxisData: requestsXAxis, seriesData: requestsSeries } = aggregateDataWeekly(nonUserDeliveries, user?.company);

  const graphXAxisData = deliveriesXAxis;
  const graphDeliveriesData = deliveriesSeries;
  const graphRequestsData = requestsSeries;

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

    <div className='top-content'>
      <div className='div-left'>
        <GuyBanner company={user?.company} link="shipments"/>
        <Graph xAxisData={graphXAxisData} deliveriesData={graphDeliveriesData} requestsData={graphRequestsData}/>
        <div style={{ height: '500px', width: '100%', marginTop: '20px' }}>
          <NewMap allRoutes={activeDeliveries} driverLocations={driverLocations} />
        </div>
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
            number={activeDeliveries.length}
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
              You have {activeDeliveries.length} active shipments and {pendingShipments} pending.
            </Typography>
            <Stack direction="row" spacing={1}>
              <button variant="contained" onClick={() => navigate('/root/shipments')}>
                View All Shipments
              </button>
              <button variant="outlined" onClick={() => navigate('/root/shipments')}>
                Add New Shipment
              </button>
            </Stack>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>;
}

export default CargoMoverDash;
