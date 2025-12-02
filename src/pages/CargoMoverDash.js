// src/pages/CargoMoverDash.js
import { useEffect, useMemo } from 'react';
import "./CargoMoverDash.css"
import Graph from '../components/Graph';
import Search from '../components/Search';
import { useAuth } from '../contexts/AuthContext';
import { useDatabase } from '../contexts/DatabaseContext';
import { useCargoMoverDeliveries } from '../contexts/CargoMoverDeliveryContext';
import { useCargoMoverDrivers } from '../contexts/CargoMoverDriverContext';
import { useNavigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';

// Default rate for estimating old deliveries without pricing (UGX per ton)
const DEFAULT_RATE_PER_TON = 1250;
const DEFAULT_RATE_PER_KM = 500;

function CargoMoverDash() {
  const { user } = useAuth();
  const { fetchNonUserDeliveriesFromAPI } = useDatabase();
  const { companyDeliveries, loadingCompanyDeliveries } = useCargoMoverDeliveries();
  const { loadingCompanyDrivers } = useCargoMoverDrivers();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.company) {
      fetchNonUserDeliveriesFromAPI();
    }
  }, [user?.company, fetchNonUserDeliveriesFromAPI]);

  const cargoMoverDeliveries = companyDeliveries.filter(
    (delivery) => delivery.company === user?.company
  );

  const activeDeliveries = cargoMoverDeliveries.filter(d =>
    d.status === 'assigned' || d.status === 'in_transit' || d.status === 'active' || d.status === 'accepted'
  );
  const pendingDeliveries = cargoMoverDeliveries.filter(d => d.status === 'pending');
  const completedDeliveries = cargoMoverDeliveries.filter(d => d.status === 'delivered' || d.status === 'completed');

  const totalShipments = cargoMoverDeliveries.length;
  const pendingShipments = pendingDeliveries.length;
  const completedShipments = completedDeliveries.length;

  // Calculate cost for a delivery (with fallback for old data)
  const calculateDeliveryCost = (delivery) => {
    // First check if delivery has pre-calculated price
    if (delivery.calculatedPrice) {
      const calcPrice = Number(delivery.calculatedPrice);
      if (!isNaN(calcPrice)) return calcPrice;
    }

    // Fallback: estimate based on weight and distance
    let price = 0;
    const weight = Number(delivery.weight) || 0;
    const distance = Number(delivery.distance) || 0;

    // Use rates from delivery if available, otherwise use defaults
    const ratePerTon = delivery.ratePerTon || DEFAULT_RATE_PER_TON;
    const ratePerKm = delivery.ratePerKm || DEFAULT_RATE_PER_KM;

    if (weight > 0) {
      const weightInTons = weight / 1000;
      price += ratePerTon * weightInTons;
    }
    if (distance > 0) {
      price += ratePerKm * distance;
    }

    return Math.round(price);
  };

  // Calculate costs using useMemo for performance
  const { activeCost, completedCost, totalCost } = useMemo(() => {
    let active = 0;
    let completed = 0;

    activeDeliveries.forEach(d => { active += calculateDeliveryCost(d); });
    completedDeliveries.forEach(d => { completed += calculateDeliveryCost(d); });

    return { activeCost: active, completedCost: completed, totalCost: active + completed };
  }, [activeDeliveries, completedDeliveries]);

  // Format currency
  const formatCurrency = (amount) => {
    return `UGX ${Math.round(amount).toLocaleString()}`;
  };

  const isLoading = loadingCompanyDeliveries || loadingCompanyDrivers;

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div className='cargo-dash'>
      {/* Header */}
      <div className='cargo-header'>
        <Search/>
        <div className='cargo-user-info'>
          <div className='cargo-user-text'>
            <p className='cargo-user-name'>{user?.username}</p>
            <p className='cargo-user-company'>{user?.company}</p>
          </div>
          <img className='cargo-user-avatar' src={user?.imageUrl} alt="User" />
        </div>
      </div>

      {/* Welcome Banner */}
      <div className='cargo-welcome'>
        <div className='cargo-welcome-content'>
          <span className='cargo-welcome-badge'>Shipment Overview</span>
          <h2 className='cargo-welcome-title'>Welcome back, {user?.username?.split(' ')[0] || 'Shipper'}! 📦</h2>
          <p className='cargo-welcome-text'>
            You have <strong>{activeDeliveries.length}</strong> active shipments and <strong>{pendingShipments}</strong> pending requests.
          </p>
        </div>
        <div className='cargo-welcome-stats'>
          <div className='cargo-stat-mini'>
            <i className="fi fi-rr-box-open"></i>
            <span>{totalShipments} Shipments</span>
          </div>
          <div className='cargo-stat-mini'>
            <i className="fi fi-rr-check"></i>
            <span>{completedShipments} Completed</span>
          </div>
        </div>
      </div>

      {/* Cost Cards Row */}
      <div className='cargo-cost-row'>
        <div className='cargo-cost-card active'>
          <div className='cargo-cost-icon'>
            <i className="fi fi-rr-shipping-fast"></i>
          </div>
          <div className='cargo-cost-info'>
            <span className='cargo-cost-label'>Active Shipments</span>
            <span className='cargo-cost-value'>{formatCurrency(activeCost)}</span>
            <span className='cargo-cost-count'>{activeDeliveries.length} in transit</span>
          </div>
        </div>
        <div className='cargo-cost-card completed'>
          <div className='cargo-cost-icon'>
            <i className="fi fi-rr-badge-check"></i>
          </div>
          <div className='cargo-cost-info'>
            <span className='cargo-cost-label'>Completed</span>
            <span className='cargo-cost-value'>{formatCurrency(completedCost)}</span>
            <span className='cargo-cost-count'>{completedShipments} delivered</span>
          </div>
        </div>
        <div className='cargo-cost-card total'>
          <div className='cargo-cost-icon'>
            <i className="fi fi-rr-wallet"></i>
          </div>
          <div className='cargo-cost-info'>
            <span className='cargo-cost-label'>Total Spent</span>
            <span className='cargo-cost-value'>{formatCurrency(totalCost)}</span>
            <span className='cargo-cost-count'>all time</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className='cargo-main'>
        {/* Left - Graph */}
        <div className='cargo-graph-section'>
          <div className='cargo-section-header'>
            <h3>Shipment Activity</h3>
          </div>
          <div className='cargo-graph-wrapper'>
            <Graph
              xAxisData={[1, 2, 3, 4, 5, 6]}
              deliveriesData={[
                0,
                pendingShipments,
                activeDeliveries.length,
                completedShipments,
                totalShipments,
                totalShipments
              ]}
              requestsData={[
                0,
                pendingShipments,
                pendingShipments,
                completedShipments,
                totalShipments,
                totalShipments
              ]}
            />
          </div>
          <button className='cargo-action-btn primary' style={{ marginTop: '16px', width: '100%', justifyContent: 'center' }} onClick={() => navigate('/root/shipments')}>
            <i className="fi fi-rr-plus"></i>
            <span>Add New Shipment</span>
          </button>
        </div>

        {/* Right - Stats */}
        <div className='cargo-stats-section'>
          <div className='cargo-section-header'>
            <h3>Quick Actions</h3>
          </div>
          <div className='cargo-quick-actions'>
            <button className='cargo-action-btn primary' onClick={() => navigate('/root/shipments')}>
              <i className="fi fi-rr-plus"></i>
              <span>New Shipment</span>
            </button>
            <button className='cargo-action-btn' onClick={() => navigate('/root/shipments')}>
              <i className="fi fi-rr-list"></i>
              <span>View All Shipments</span>
            </button>
          </div>

          <div className='cargo-section-header' style={{ marginTop: '20px' }}>
            <h3>Shipment Status</h3>
          </div>
          <div className='cargo-status-list'>
            <div className='cargo-status-item'>
              <div className='cargo-status-icon pending'>
                <i className="fi fi-rr-hourglass-end"></i>
              </div>
              <div className='cargo-status-info'>
                <span className='cargo-status-label'>Pending</span>
                <span className='cargo-status-count'>{pendingShipments}</span>
              </div>
            </div>
            <div className='cargo-status-item'>
              <div className='cargo-status-icon active'>
                <i className="fi fi-rr-truck-moving"></i>
              </div>
              <div className='cargo-status-info'>
                <span className='cargo-status-label'>In Transit</span>
                <span className='cargo-status-count'>{activeDeliveries.length}</span>
              </div>
            </div>
            <div className='cargo-status-item'>
              <div className='cargo-status-icon completed'>
                <i className="fi fi-rr-check-circle"></i>
              </div>
              <div className='cargo-status-info'>
                <span className='cargo-status-label'>Delivered</span>
                <span className='cargo-status-count'>{completedShipments}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CargoMoverDash;