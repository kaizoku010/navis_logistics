import React, { useEffect, useState } from 'react';
import { useDriverAuth } from '../contexts/DriverAuthContext'; // Use useDriverAuth
import { useDatabase } from '../contexts/DatabaseContext';
import NewMap from './NewMap'; // Reusing the NewMap component
import './driverDashboard.css'; // Assuming a new CSS file for styling

function DriverDashboard() {
  const { driver } = useDriverAuth(); // Get driver from useDriverAuth
  const { deliveries, trucks, assignments, fetchDeliveriesFromAPI, fetchTrucksFromAPI, fetchAssignmentsFromAPI, updateDriverLocationInAPI, updateDeliveryStatusForDeliveryCollectionInAPI } = useDatabase();

  const [currentDelivery, setCurrentDelivery] = useState(null);
  const [currentTruck, setCurrentTruck] = useState(null);
  const [isTrackingLocation, setIsTrackingLocation] = useState(false);

  useEffect(() => {
    fetchDeliveriesFromAPI();
    fetchTrucksFromAPI();
    fetchAssignmentsFromAPI();
  }, []);

  useEffect(() => {
    if (driver && assignments.length > 0 && deliveries.length > 0 && trucks.length > 0) {
      const assignment = assignments.find(a => a.driverId === driver.uid);
      if (assignment) {
        const delivery = deliveries.find(d => d.uid === assignment.deliveryId);
        const truck = trucks.find(t => t.uid === assignment.truckId);
        setCurrentDelivery(delivery);
        setCurrentTruck(truck);
      }
    }
  }, [driver, assignments, deliveries, trucks]);

  useEffect(() => {
    let intervalId;
    if (isTrackingLocation && driver?.uid) {
      const updateLocation = () => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            updateDriverLocationInAPI(driver.uid, latitude, longitude, 'in_transit');
          },
          (error) => {
            console.error("Error getting location:", error);
          },
          { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
        );
      };
      updateLocation(); // Initial update
      intervalId = setInterval(updateLocation, 300000); // 5 minutes
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isTrackingLocation, driver?.uid, updateDriverLocationInAPI]);

  const handleStartDelivery = async () => {
    if (!currentDelivery || !driver?.uid) {
      alert("No current delivery or driver ID available.");
      return;
    }
    setIsTrackingLocation(true);
    await updateDeliveryStatusForDeliveryCollectionInAPI(currentDelivery.uid, 'in_transit');
    alert("Delivery started! Tracking location...");
  };

  const handleStopDelivery = async () => {
    if (!currentDelivery || !driver?.uid) {
      alert("No current delivery or driver ID available.");
      return;
    }
    setIsTrackingLocation(false);
    await updateDeliveryStatusForDeliveryCollectionInAPI(currentDelivery.uid, 'delivered');
    alert("Delivery stopped. Location tracking paused.");
  };

  const mapRoutes = currentDelivery ? [{
    uid: currentDelivery.uid,
    pickupCoords: { lat: Number(currentDelivery.pickupCoords.lat.N), lng: Number(currentDelivery.pickupCoords.lng.N) },
    destinationCoords: { lat: Number(currentDelivery.destinationCoords.lat.N), lng: Number(currentDelivery.destinationCoords.lng.N) },
    truckId: currentTruck ? currentTruck.uid : null,
  }] : [];

  return (
    <div className="driver-dashboard">
      <h1>Driver Dashboard</h1>
      <div className="dashboard-content">
        <div className="map-section">
          <NewMap allRoutes={mapRoutes} selectedRoute={mapRoutes.length > 0 ? mapRoutes[0] : null} />
          {mapRoutes.length === 0 && (
            <div className="map-overlay-text">
              <p>No active delivery route to display.</p>
            </div>
          )}
        </div>
        <div className="control-panel-section">
          <h2>Current Delivery</h2>
          {currentDelivery ? (
            <div>
              <p><strong>Name:</strong> {currentDelivery.name}</p>
              <p><strong>Status:</strong> {currentDelivery.status}</p>
              <p><strong>From:</strong> {currentDelivery.pickupPoint}</p>
              <p><strong>To:</strong> {currentDelivery.destination}</p>
              {currentTruck && (
                <p><strong>Assigned Truck:</strong> {currentTruck.numberPlate} ({currentTruck.type})</p>
              )}
              <button onClick={handleStartDelivery} disabled={isTrackingLocation}>Start Delivery</button>
              <button onClick={handleStopDelivery} disabled={!isTrackingLocation}>Stop Delivery</button>
            </div>
          ) : (
            <p>No current delivery assigned.</p>
          )}
          <h2>Driver Profile</h2>
          {driver?.imageUrl && (
            <img src={driver.imageUrl} alt="Driver Profile" className="driver-profile-pic" />
          )}
          <p><strong>Name:</strong> {driver?.name}</p>
          <p><strong>Email:</strong> {driver?.email}</p>
        </div>
      </div>
    </div>
  );
}

export default DriverDashboard;