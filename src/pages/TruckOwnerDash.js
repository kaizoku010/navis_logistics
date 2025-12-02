import React, { useEffect, useMemo } from 'react';
import "./TruckOwnerDash.css"
import Graph from '../components/Graph';
import Search from '../components/Search';
import { useAuth } from '../contexts/AuthContext';
import { useDatabase } from '../contexts/DatabaseContext';
import { useTruckOwnerTrucks } from '../contexts/TruckOwnerTruckContext';
import { useTruckOwnerDrivers } from '../contexts/TruckOwnerDriverContext';
import Trucks from  "../assets/vv.png"
import { Box, CircularProgress } from '@mui/material';

function TruckOwnerDash() {
  const { user } = useAuth();
  const { nonUserDeliveries, deliveries, fetchPricingModelFromAPI, pricingModel } = useDatabase();
  const { companyTrucks, loadingCompanyTrucks } = useTruckOwnerTrucks();
  const { companyDrivers, loadingCompanyDrivers } = useTruckOwnerDrivers();

  // Fetch pricing model for the company
  useEffect(() => {
    if (user?.company) {
      fetchPricingModelFromAPI(user.company);
    }
  }, [user?.company, fetchPricingModelFromAPI]);



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
    delivery.acceptedBy?.toLowerCase() === user.company.toLowerCase() &&
    (delivery.status === 'in_transit' || delivery.status === 'en_route' || delivery.status === 'active' || delivery.status === 'accepted')
  );
};

  // Calculate income from deliveries
  const calculateIncomeFromDeliveries = (deliveriesList, model) => {
    if (!deliveriesList || deliveriesList.length === 0 || !model) {
      return 0;
    }

    return deliveriesList.reduce((total, delivery) => {
      let price = 0;

      // First check if delivery has pre-calculated price
      if (delivery.calculatedPrice) {
        const calcPrice = Number(delivery.calculatedPrice);
        if (!isNaN(calcPrice)) {
          return total + calcPrice;
        }
      }

      // Fallback: calculate based on pricing model (distance + weight)
      // Add distance-based price
      if (model.ratePerKm && delivery.distance) {
        const distanceValue = Number(delivery.distance);
        if (!isNaN(distanceValue)) {
          price += model.ratePerKm * distanceValue;
        }
      }

      // Add weight-based price (weight is in kg, convert to tons)
      if (model.ratePerTon && delivery.weight) {
        const weightValue = Number(delivery.weight);
        if (!isNaN(weightValue) && weightValue > 0) {
          const weightInTons = weightValue / 1000;
          price += model.ratePerTon * weightInTons;
        }
      }

      return total + price;
    }, 0);
  };

  // Income calculations using useMemo for performance
  const activeRoutesIncome = useMemo(() => {
    if (!pricingModel) return 0;
    const activeDeliveries = getActiveDeliveriesByCompany();
    return calculateIncomeFromDeliveries(activeDeliveries, pricingModel);
  }, [deliveries, user?.company, pricingModel]);

  const completedRoutesIncome = useMemo(() => {
    if (!pricingModel) return 0;
    const completed = completedDeliveriesByCompany();
    return calculateIncomeFromDeliveries(completed, pricingModel);
  }, [nonUserDeliveries, user?.company, pricingModel]);

  const pendingRoutesIncome = useMemo(() => {
    if (!pricingModel) return 0;
    const pending = deliveries.filter(delivery =>
      delivery.company?.toLowerCase() === user?.company?.toLowerCase() &&
      delivery.status === 'pending'
    );
    return calculateIncomeFromDeliveries(pending, pricingModel);
  }, [deliveries, user?.company, pricingModel]);

  // Format currency
  const formatCurrency = (amount) => {
    return `UGX ${Math.round(amount).toLocaleString()}`;
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

return (
  <div className='trucker-dash'>
    {/* Header */}
    <div className='trucker-header'>
      <Search/>
      <div className='trucker-user-info'>
        <div className='trucker-user-text'>
          <p className='trucker-user-name'>{user?.username}</p>
          <p className='trucker-user-company'>{user?.company}</p>
        </div>
        <img className='trucker-user-avatar' src={user?.imageUrl} alt="User profile" />
      </div>
    </div>

    {/* Welcome Banner */}
    <div className='trucker-welcome'>
      <div className='trucker-welcome-content'>
        <span className='trucker-welcome-badge'>Dashboard Overview</span>
        <h2 className='trucker-welcome-title'>Welcome back, {user?.username?.split(' ')[0] || 'Trucker'}! 👋</h2>
        <p className='trucker-welcome-text'>
          You have <strong>{getActiveDeliveriesByCompany().length}</strong> active deliveries and <strong>{pendingDeliveriesCompany().length}</strong> pending requests today.
        </p>
      </div>
      <div className='trucker-welcome-stats'>
        <div className='trucker-stat-mini'>
          <i className="fi fi-rr-truck-moving"></i>
          <span>{getSortedtrucksByCompany().length} Trucks</span>
        </div>
        <div className='trucker-stat-mini'>
          <i className="fi fi-rr-user"></i>
          <span>{getSortedDriversByCompany().length} Drivers</span>
        </div>
      </div>
    </div>

    {/* Income Cards Row */}
    <div className='trucker-income-row'>
      <div className='trucker-income-card active'>
        <div className='trucker-income-icon'>
          <i className="fi fi-rr-route"></i>
        </div>
        <div className='trucker-income-info'>
          <span className='trucker-income-label'>Active Routes</span>
          <span className='trucker-income-value'>{formatCurrency(activeRoutesIncome || 0)}</span>
          <span className='trucker-income-count'>{getActiveDeliveriesByCompany().length} deliveries</span>
        </div>
      </div>
      <div className='trucker-income-card completed'>
        <div className='trucker-income-icon'>
          <i className="fi fi-rr-badge-check"></i>
        </div>
        <div className='trucker-income-info'>
          <span className='trucker-income-label'>Completed</span>
          <span className='trucker-income-value'>{formatCurrency(completedRoutesIncome || 0)}</span>
          <span className='trucker-income-count'>{completedDeliveriesByCompany().length} deliveries</span>
        </div>
      </div>
      <div className='trucker-income-card pending'>
        <div className='trucker-income-icon'>
          <i className="fi fi-rr-hourglass-end"></i>
        </div>
        <div className='trucker-income-info'>
          <span className='trucker-income-label'>Potential</span>
          <span className='trucker-income-value'>{formatCurrency(pendingRoutesIncome || 0)}</span>
          <span className='trucker-income-count'>{pendingDeliveriesCompany().length} pending</span>
        </div>
      </div>
    </div>

    {/* Main Content */}
    <div className='trucker-main'>
      {/* Left - Graph */}
      <div className='trucker-graph-section'>
        <div className='trucker-section-header'>
          <h3>Performance Overview</h3>
        </div>
        <div className='trucker-graph-wrapper'>
          <Graph
            xAxisData={[1, 2, 3, 4, 5, 6]}
            deliveriesData={[
              1, 2, 3,
              getSortedDeliveriesByCompany().length || 4,
              getSortedDeliveriesByCompany().length || 5,
              getSortedDeliveriesByCompany().length || 5
            ]}
            requestsData={[
              0, 1,
              pendingDeliveriesCompany().length || 2,
              pendingDeliveriesCompany().length || 2,
              pendingDeliveriesCompany().length || 2,
              pendingDeliveriesCompany().length || 2
            ]}
          />
        </div>
      </div>

      {/* Right - Stats Grid */}
      <div className='trucker-stats-section'>
        <div className='trucker-section-header'>
          <h3>Quick Stats</h3>
        </div>
        <div className='trucker-stats-grid'>
          <div className='trucker-stat-card'>
            <i className="fi fi-rr-check-circle"></i>
            <div className='trucker-stat-info'>
              <span className='trucker-stat-number'>{getSortedDeliveriesByCompany().length}</span>
              <span className='trucker-stat-label'>Accepted</span>
            </div>
          </div>
          <div className='trucker-stat-card'>
            <i className="fi fi-rr-time-fast"></i>
            <div className='trucker-stat-info'>
              <span className='trucker-stat-number'>{pendingDeliveriesCompany().length}</span>
              <span className='trucker-stat-label'>Pending</span>
            </div>
          </div>
          <div className='trucker-stat-card'>
            <i className="fi fi-rr-badge-check"></i>
            <div className='trucker-stat-info'>
              <span className='trucker-stat-number'>{completedDeliveriesByCompany().length}</span>
              <span className='trucker-stat-label'>Completed</span>
            </div>
          </div>
          <div className='trucker-stat-card'>
            <i className="fi fi-rr-truck-moving"></i>
            <div className='trucker-stat-info'>
              <span className='trucker-stat-number'>{getActiveDeliveriesByCompany().length}</span>
              <span className='trucker-stat-label'>Active</span>
            </div>
          </div>
          <div className='trucker-stat-card highlight'>
            <i className="fi fi-rr-user"></i>
            <div className='trucker-stat-info'>
              <span className='trucker-stat-number'>{getSortedDriversByCompany().length}</span>
              <span className='trucker-stat-label'>Drivers</span>
            </div>
          </div>
          <div className='trucker-stat-card highlight'>
            <i className="fi fi-rr-shipping-fast"></i>
            <div className='trucker-stat-info'>
              <span className='trucker-stat-number'>{getSortedtrucksByCompany().length}</span>
              <span className='trucker-stat-label'>Trucks</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
}

export default TruckOwnerDash;