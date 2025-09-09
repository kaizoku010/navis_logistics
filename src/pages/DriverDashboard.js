import React, { useEffect, useState } from 'react';
import { useDriverAuth } from '../contexts/DriverAuthContext'; // Use useDriverAuth
import { useDatabase } from '../contexts/DatabaseContext';
import NewMap from './NewMap'; // Reusing the NewMap component
import { useNavigate } from 'react-router-dom'; // Added
import { Card, Descriptions, List, Empty, Button, message } from 'antd';
import './driverDashboard.css'; // Assuming a new CSS file for styling

function DriverDashboard() {
  const { driver } = useDriverAuth(); // Get driver from useDriverAuth
  const { deliveries, trucks, assignments, fetchDeliveriesFromAPI, fetchTrucksFromAPI, fetchAssignmentsFromAPI, updateDriverLocationInAPI, updateDeliveryStatusForDeliveryCollectionInAPI } = useDatabase();
  const navigate = useNavigate();

  const [currentDelivery, setCurrentDelivery] = useState(null);
  const [currentTruck, setCurrentTruck] = useState(null);
  const [isTrackingLocation, setIsTrackingLocation] = useState(false);
  const [startTime, setStartTime] = useState(null); // New state for start time
  const [elapsedTime, setElapsedTime] = useState(0); // New state for elapsed time in seconds

  useEffect(() => {
    fetchDeliveriesFromAPI();
    fetchTrucksFromAPI();
    fetchAssignmentsFromAPI();
  }, []);

  useEffect(() => {
    if (driver && deliveries.length > 0 && trucks.length > 0) {
      // Use currentDeliveryId and currentTruckId directly from the driver object
      const currentDeliveryId = driver.currentDeliveryId;
      const currentTruckId = driver.currentTruckId;

      let foundDelivery = null;
      let foundTruck = null;

      if (currentDeliveryId) {
        foundDelivery = deliveries.find(d => d.id === currentDeliveryId); // Assuming delivery.id matches currentDeliveryId
      }
      if (currentTruckId) {
        foundTruck = trucks.find(t => t.id === currentTruckId); // Assuming truck.id matches currentTruckId
      }

      setCurrentDelivery(foundDelivery);
      setCurrentTruck(foundTruck);
    }
  }, [driver, deliveries, trucks]); // Removed assignments from dependency array

  useEffect(() => {
    let intervalId;
    if (isTrackingLocation && driver?.uid) {
      const updateLocation = () => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            updateDriverLocationInAPI(driver.id, latitude, longitude, 'in_transit');
          },
          (error) => {
            console.error("Error getting location:", error);
          },
          { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
        );
      };
      updateLocation(); // Initial update
      intervalId = setInterval(updateLocation, 600000); // 10 minutes
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isTrackingLocation, driver?.uid, updateDriverLocationInAPI]);

  const handleStartDelivery = async () => {
    if (!currentDelivery || !driver?.id) {
      message.error("No current delivery or driver ID available.");
      return;
    }

    // Get current location immediately
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        // Update driver's location in Firebase immediately
        await updateDriverLocationInAPI(driver.id, latitude, longitude, 'in_transit');

        // Set tracking state and start time
        setIsTrackingLocation(true);
        const now = Date.now();
        setStartTime(now);

        // Update delivery status and start time in Firebase
        await updateDeliveryStatusForDeliveryCollectionInAPI(
          currentDelivery.id,
          'in_transit',
          currentDelivery.acceptedBy,
          currentDelivery.truckId,
          driver.id,
          now
        );
        message.success("Delivery started! Tracking location...");
      },
      (error) => {
        console.error("Error getting initial location:", error);
        message.error("Could not get current location. Please ensure location services are enabled.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 } // Request fresh, high-accuracy location
    );
  };

  useEffect(() => {
    let timerInterval;
    if (isTrackingLocation && startTime) {
      timerInterval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000)); // Update every second
      }, 1000);
    } else {
      setElapsedTime(0); // Reset if not tracking or no start time
    }

    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [isTrackingLocation, startTime]);

  const handleStopDelivery = async () => {
    if (!currentDelivery || !driver?.id) {
      message.error("No current delivery or driver ID available.");
      return;
    }
    setIsTrackingLocation(false);
    const now = Date.now(); // Get current timestamp as end time
    const duration = Math.floor((now - startTime) / 1000); // Calculate total duration in seconds

    await updateDeliveryStatusForDeliveryCollectionInAPI(
      currentDelivery.id, // Use currentDelivery.id
      'delivered',
      currentDelivery.acceptedBy,
      currentDelivery.truckId,
      driver.id,
      startTime, // Pass start time
      now,       // Pass end time
      duration   // Pass total duration
    );
    setStartTime(null); // Reset start time
    setElapsedTime(0); // Reset elapsed time
    message.info("Delivery stopped. Location tracking paused.");
  };

  const mapRoutes = currentDelivery ? [{
    uid: currentDelivery.uid,
    // If tracking, origin is driver's current location, otherwise it's the delivery pickup
    originCoords: isTrackingLocation && typeof driver?.currentLatitude === 'number' && typeof driver?.currentLongitude === 'number'
      ? { lat: driver.currentLatitude, lng: driver.currentLongitude }
      : {
          lat: Number(currentDelivery.pickupCoords.lat?.N || currentDelivery.pickupCoords.lat),
          lng: Number(currentDelivery.pickupCoords.lng?.N || currentDelivery.pickupCoords.lng)
        },
    destinationCoords: {
      lat: Number(currentDelivery.destinationCoords.lat?.N || currentDelivery.destinationCoords.lat),
      lng: Number(currentDelivery.destinationCoords.lng?.N || currentDelivery.destinationCoords.lng)
    },
    truckId: currentTruck ? currentTruck.uid : null,
  }] : [];

  return (
    <div className="driver-dashboard">
      {/* <h1>Driver Dashboard</h1> */}
      <div className="dashboard-content">
        <div className="map-section">
          <NewMap
            allRoutes={mapRoutes}
            selectedRoute={mapRoutes.length > 0 ? mapRoutes[0] : null}
            driverCurrentLocation={driver?.currentLatitude && driver?.currentLongitude ? { lat: driver.currentLatitude, lng: driver.currentLongitude, imageUrl: driver.imageUrl } : null}
          />
          {mapRoutes.length === 0 && (
            <div className="map-overlay-text">
              <p>No active delivery route to display.</p>
            </div>
          )}
        </div>
        <div className="control-panel-section">
          <Card title="Current Delivery" style={{ marginBottom: 20 }}>
            {currentDelivery ? (
              <>
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Name">{currentDelivery.name}</Descriptions.Item>
                  <Descriptions.Item label="Status">{currentDelivery.status}</Descriptions.Item>
                  <Descriptions.Item label="From">{currentDelivery.pickupPoint}</Descriptions.Item>
                  <Descriptions.Item label="To">{currentDelivery.destination}</Descriptions.Item>
                  {/* Always render Descriptions.Item, conditionally render its content */}
                  <Descriptions.Item label="Assigned Truck">
                    {currentTruck ? `${currentTruck.numberPlate} (${currentTruck.type})` : 'N/A'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Elapsed Time">
                    {new Date(elapsedTime * 1000).toISOString().substr(11, 8)}
                  </Descriptions.Item>
                </Descriptions>
                <div style={{ marginTop: 16 }}>
                  <Button type="primary" onClick={handleStartDelivery} disabled={isTrackingLocation} style={{ marginRight: 8 }}>
                    Start Delivery
                  </Button>
                  <Button onClick={handleStopDelivery} disabled={!isTrackingLocation}>
                    Stop Delivery
                  </Button>
                </div>
              </>
            ) : (
              <Empty description="No current delivery assigned." />
            )}
          </Card>

          <Card title="Past Routes" style={{ marginBottom: 20 }}>
            {driver?.pastDeliveries && driver.pastDeliveries.length > 0 ? (
              <List
                itemLayout="horizontal"
                dataSource={driver.pastDeliveries}
                renderItem={(route, index) => (
                  <List.Item>
                    <List.Item.Meta
                      title={<strong>{route.name}</strong>}
                      description={`From ${route.pickupPoint} to ${route.destination} (Completed: ${new Date(route.deliveryDate).toLocaleDateString()})`}
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="No past routes to display yet." />
            )}
          </Card>

          <div className="profile-link-section">
            <Button type="default" onClick={() => navigate('/root/driver/profile')}>
              View Full Profile
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DriverDashboard;