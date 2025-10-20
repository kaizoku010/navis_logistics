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
import { useCargoMoverDeliveries } from '../contexts/CargoMoverDeliveryContext';
import { useCargoMoverDrivers } from '../contexts/CargoMoverDriverContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, Typography, Button, Stack, Grid, Box, CircularProgress } from '@mui/material';
import { Add, ListAlt } from '@mui/icons-material';

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
  const { nonUserDeliveries, fetchNonUserDeliveriesFromAPI } = useDatabase(); // Keep nonUserDeliveries if still needed
  const { companyDeliveries, loadingCompanyDeliveries } = useCargoMoverDeliveries();
  const { companyDrivers, loadingCompanyDrivers } = useCargoMoverDrivers();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.company) {
      fetchNonUserDeliveriesFromAPI(); // Keep if nonUserDeliveries are still fetched via useDatabase
    }
  }, [user?.company, fetchNonUserDeliveriesFromAPI]);

  const cargoMoverDeliveries = companyDeliveries.filter(
    (delivery) => delivery.company === user?.company
  );

  const activeDeliveries = cargoMoverDeliveries.filter(d => d.status === 'assigned' || d.status === 'in_transit');

  const driverLocations = activeDeliveries.map(delivery => {
    const driver = companyDrivers.find(d => d.id === delivery.driverId);
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

  const isLoading = loadingCompanyDeliveries || loadingCompanyDrivers;

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div className='dash-des'>
      <div className='header card'>
        <Search/>
        <div className='name_user_image'>
          <div className='cargo-mover-data'>
            <p className='c_userName'>{user?.username}</p>
            <p className='c_userComp'>{user?.company}</p>  
            <p className='c_userComp'>{user?.accountType}</p>  
          </div>
        </div>
      </div>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        {/* Left Side */}
        <Grid item xs={12} md={8}>
          <Stack spacing={3}>
            <Card>
              <CardContent>
                <GuyBanner company={user?.company} link="shipments"/>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <Graph xAxisData={graphXAxisData} deliveriesData={graphDeliveriesData} requestsData={graphRequestsData}/>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <div style={{ height: '500px', width: '100%' }}>
                  <NewMap allRoutes={activeDeliveries} driverLocations={driverLocations} />
                </div>
              </CardContent>
            </Card>
          </Stack>
        </Grid>

        {/* Right Side */}
        <Grid item xs={12} md={4}>
          <Stack spacing={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="div" gutterBottom>
                  Shipment Stats
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <IconBox
                      iconClass="fi fi-sr-check-circle"
                      number={totalShipments}
                      title={"Total Shipments"}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <IconBox
                      iconClass="fi fi-sr-hourglass-end"
                      number={pendingShipments}
                      title={"Pending Shipments"}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <IconBox
                      iconClass="fi fi-sr-shipping-fast"
                      number={activeDeliveries.length}
                      title={"Active Shipments"}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <IconBox
                      iconClass="fi fi-sr-check-circle"
                      number={completedShipments}
                      title={"Completed Shipments"}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
            <Card sx={{ backgroundColor: '#1976d2', color: 'white' }}>
              <CardContent>
                <Typography variant="h5" component="div" gutterBottom>
                  Shipment Overview
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  You have {activeDeliveries.length} active and {pendingShipments} pending shipments.
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Button 
                    variant="contained"
                    startIcon={<ListAlt />}
                    onClick={() => navigate('/root/shipments')}
                    sx={{ backgroundColor: 'white', color: '#1976d2', '&:hover': { backgroundColor: '#e0e0e0' } }}
                  >
                    View All Shipments
                  </Button>
                  <Button 
                    variant="outlined"
                    startIcon={<Add />}
                    onClick={() => navigate('/root/shipments')}
                    sx={{ color: 'white', borderColor: 'white', '&:hover': { borderColor: '#e0e0e0', backgroundColor: 'rgba(255, 255, 255, 0.1)' } }}
                  >
                    Add New Shipment
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </div>
  );
}

export default CargoMoverDash;