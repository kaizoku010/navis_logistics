import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useDatabase } from '../contexts/DatabaseContext';
import NewMap from './NewMap'; // Reusing the NewMap component
import './driverDashboard.css'; // Assuming a new CSS file for styling

function DriverDashboard() {
  const { user } = useAuth();
  

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

  // Identify current delivery and truck based on user's data
  useEffect(() => {
    if (user && user.currentDeliveryId && deliveries.length > 0) {
      const foundDelivery = deliveries.find(d => d.uid === user.currentDeliveryId);
      setCurrentDelivery(foundDelivery);
    }
    if (user && user.currentTruckId && trucks.length > 0) {
      const foundTruck = trucks.find(t => t.uid === user.currentTruckId);
      setCurrentTruck(foundTruck);
    }
  }, [user, deliveries, trucks]);

  // Real-time location tracking effect
  useEffect(() => {
    let watchId;
    if (isTrackingLocation && user?.uid) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          updateDriverLocationInAPI(user.uid, latitude, longitude, 'in_transit'); // Update driver's location and status
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
  }, [isTrackingLocation, user?.uid, updateDriverLocationInAPI]);

  // Handlers for Start/Stop Delivery buttons
  const handleStartDelivery = async () => {
    if (!currentDelivery || !user?.uid) {
      alert("No current delivery or driver ID available.");
      return;
    }
    setIsTrackingLocation(true);
    await updateDeliveryStatusForDeliveryCollectionInAPI(currentDelivery.uid, 'in_transit');
    alert("Delivery started! Tracking location...");
  };

  const handleStopDelivery = async () => {
    if (!currentDelivery || !user?.uid) {
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
          {mapRoutes.length > 0 ? (
            <NewMap allRoutes={mapRoutes} selectedRoute={mapRoutes[0]} />
          ) : (
            <p>No active delivery route to display.</p>
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
          <p><strong>Username:</strong> {user?.username}</p>
          <p><strong>Company:</strong> {user?.company}</p>
          {/* More profile details */}
        </div>
      </div>
    </div>
  );
}

export default DriverDashboard;
