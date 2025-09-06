import React, { useEffect, useState } from 'react';
import { useDriverAuth } from '../contexts/DriverAuthContext'; // Use useDriverAuth
import { useDatabase } from '../contexts/DatabaseContext';
import NewMap from './NewMap'; // Reusing the NewMap component
import './driverDashboard.css'; // Assuming a new CSS file for styling

function DriverDashboard() {
  const { driver } = useDriverAuth(); // Get driver from useDriverAuth
  console.log("Driver currentTruckId from useDriverAuth:", driver?.currentTruckId);

  const { deliveries, trucks, assignments, fetchDeliveriesFromAPI, fetchTrucksFromAPI, fetchAssignmentsFromAPI, updateDriverLocationInAPI, updateDeliveryStatusForDeliveryCollectionInAPI } = useDatabase(); // Added updateDriverLocationInAPI, updateDeliveryStatusForDeliveryCollectionInAPI

  const [currentDelivery, setCurrentDelivery] = useState(null);
  const [currentTruck, setCurrentTruck] = useState(null);
  const [isTrackingLocation, setIsTrackingLocation] = useState(false); // New state for tracking

  // Fetch all necessary data on component mount
  useEffect(() => {
    fetchDeliveriesFromAPI();
    fetchTrucksFromAPI();
    fetchAssignmentsFromAPI();
  }, []);

  // Identify current delivery and truck based on driver's data
  useEffect(() => {
    console.log("Inside useEffect - Driver object:", driver);
    console.log("Inside useEffect - Trucks available:", trucks);
    if (driver && driver.currentDeliveryId && deliveries.length > 0) {
      const foundDelivery = deliveries.find(d => d.uid === driver.currentDeliveryId);
      setCurrentDelivery(foundDelivery);
    }
    if (driver && driver.currentTruckId && trucks.length > 0) {
      const foundTruck = trucks.find(t => t.id === driver.currentTruckId);
      setCurrentTruck(foundTruck);
    }
  }, [driver, deliveries, trucks]);

  // Real-time location tracking effect
  useEffect(() => {
    let watchId;
    if (isTrackingLocation && driver?.id) { // Use driver.id for uid
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          updateDriverLocationInAPI(driver.id, latitude, longitude, 'in_transit'); // Update driver's location and status
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Error getting location. Please ensure location services are enabled.");
          setIsTrackingLocation(false); // Stop tracking on error
        },
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
      );
    }

    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [isTrackingLocation, driver?.id, updateDriverLocationInAPI]);

  // Handlers for Start/Stop Delivery buttons
  const handleStartDelivery = async () => {
    if (!currentDelivery || !driver?.id) { // Use driver.id
      alert("No current delivery or driver ID available.");
      return;
    }
    setIsTrackingLocation(true);
    await updateDeliveryStatusForDeliveryCollectionInAPI(currentDelivery.uid, 'in_transit');
    alert("Delivery started! Tracking location...");
  };

  const handleStopDelivery = async () => {
    if (!currentDelivery || !driver?.id) { // Use driver.id
      alert("No current delivery or driver ID available.");
      return;
    }
    setIsTrackingLocation(false);
    await updateDeliveryStatusForDeliveryCollectionInAPI(currentDelivery.uid, 'delivered');
    alert("Delivery stopped. Location tracking paused.");
  };

  // Prepare data for NewMap (single route for current delivery)
  const mapRoutes = currentDelivery ? [{
    uid: currentDelivery.uid,
    pickupCoords: { lat: Number(currentDelivery.pickupCoords.lat.N), lng: Number(currentDelivery.pickupCoords.lng.N) },
    destinationCoords: { lat: Number(currentDelivery.destinationCoords.lat.N), lng: Number(currentDelivery.destinationCoords.lng.N) },
    truckId: currentTruck ? currentTruck.uid : null, // Pass truckId for marker
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
              {/* Start/Stop buttons will go here */}
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
          <p><strong>Phone:</strong> {driver?.phoneNumber}</p>
          <p><strong>Company:</strong> {driver?.company}</p>
          <p><strong>Role:</strong> {driver?.role}</p>
          <p><strong>Status:</strong> {driver?.status}</p>
          {driver?.age && <p><strong>Age:</strong> {driver.age}</p>}
          {driver?.ninNumber && <p><strong>NIN:</strong> {driver.ninNumber}</p>}
          {driver?.permitId && <p><strong>Permit ID:</strong> {driver.permitId}</p>}
          {currentTruck && (
            <p><strong>Assigned Truck:</strong> {currentTruck.numberPlate} ({currentTruck.type})</p>
          )}
          {/* More profile details */}
        </div>
      </div>
    </div>
  );
}

export default DriverDashboard;
