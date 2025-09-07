import React, { useEffect, useState } from 'react';
import { useDatabase } from '../contexts/DatabaseContext';
import { useAuth } from '../contexts/AuthContext';
import NewMap from './NewMap'; // Adjust the import path as necessary
import './accepted_deliveries.css';
import { Steps, Button } from 'antd';

const AcceptedDeliveries = () => {
  const { deliveries, trucks, assignments, loading, fetchDeliveriesFromAPI, fetchTrucksFromAPI, fetchAssignmentsFromAPI } = useDatabase();
  const { user } = useAuth();
  const [allRoutesData, setAllRoutesData] = useState([]); // New state for all routes
  const [selectedDelivery, setSelectedDelivery] = useState(null); // Keep for single route display

  // Fetch all necessary data on component mount
  useEffect(() => {
    fetchDeliveriesFromAPI();
    fetchTrucksFromAPI();
    fetchAssignmentsFromAPI();
  }, []);

  // console.log("user's company: ", typeof(user?.company))
  console.log("user's company: ",user?.company)

  // Filter and prepare all routes data
  useEffect(() => {
    if (!loading && deliveries.length > 0 && trucks.length > 0 && assignments.length > 0) {
      const filteredDeliveries = deliveries.filter(
        (delivery) =>
          delivery.acceptedBy === user.company
      );

      const routes = filteredDeliveries.map((delivery) => {
        const assignment = assignments.find(
          (assign) => assign.deliveryId === delivery.uid
        );
        const truck = assignment ? trucks.find((t) => t.uid === assignment.truckId) : null;

        return {
          ...delivery,
          truckId: truck ? truck.uid : null,
          truckNumberPlate: truck ? truck.numberPlate : null,
          // Add other truck/driver info here as needed for tooltips
        };
      });
      setAllRoutesData(routes);
    }
  }, [loading, deliveries, trucks, assignments, user.company]);

  const handleShowRoute = (delivery) => {
    setSelectedDelivery(delivery);
  };

  return (
    <div className='map_section_div'>
      <div className='accepted_deliveries_list'>
        {loading ? (
          <p>Loading deliveries...</p>
        ) : allRoutesData.length === 0 ? (
          <p>No pending/active deliveries found</p>
        ) : (
          <ul>
            {allRoutesData.map(delivery => (
              <li
                key={delivery.uid}
                className='delivery-item'
              >
                <h3 className='del-name'>{delivery.name}</h3>
                <p className='contact-text'>Contact: {delivery.contact}</p>
                <p>Status: {delivery.status}</p> {/* Display status */}
                {delivery.truckNumberPlate && <p>Truck: {delivery.truckNumberPlate}</p>} {/* Display truck if assigned */}
                <div className='steps'>
                  <Steps
                    progressDot
                    current={1}
                    className='steps'
                    direction="vertical"
                    items={[
                      {
                        title: 'Pickup',
                        description: delivery.pickupPoint,
                      },
                      {
                        title: 'Destination',
                        description: delivery.destination,
                      }
                    ]}
                  />
                </div>
                <Button
                  type="primary"
                  onClick={() => handleShowRoute(delivery)}
                >
                  Show Route
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="maps-dd">
        {/* Pass allRoutesData to NewMap. NewMap will handle plotting multiple routes */}
        {allRoutesData.length > 0 ? (
          <NewMap
            allRoutes={allRoutesData.map(route => {
              const defaultCoords = { lat: 0, lng: 0 }; // A safe default
              const pickupLat = Number(route.pickupCoords?.lat?.N || route.pickupCoords?.lat);
              const pickupLng = Number(route.pickupCoords?.lng?.N || route.pickupCoords?.lng);
              const destinationLat = Number(route.destinationCoords?.lat?.N || route.destinationCoords?.lat);
              const destinationLng = Number(route.destinationCoords?.lng?.N || route.destinationCoords?.lng);

              return {
                pickupCoords: (isNaN(pickupLat) || isNaN(pickupLng)) ? defaultCoords : { lat: pickupLat, lng: pickupLng },
                destinationCoords: (isNaN(destinationLat) || isNaN(destinationLng)) ? defaultCoords : { lat: destinationLat, lng: destinationLng },
                truckId: route.truckId,
              };
            })}
            // If a specific delivery is selected from the list, show its route highlighted
            selectedRoute={selectedDelivery ? (() => {
              const defaultCoords = { lat: 0, lng: 0 };
              const pickupLat = Number(selectedDelivery.pickupCoords?.lat?.N);
              const pickupLng = Number(selectedDelivery.pickupCoords?.lng?.N);
              const destinationLat = Number(selectedDelivery.destinationCoords?.lat?.N);
              const destinationLng = Number(selectedDelivery.destinationCoords?.lng?.N);

              return {
                pickupCoords: (isNaN(pickupLat) || isNaN(pickupLng)) ? defaultCoords : { lat: pickupLat, lng: pickupLng },
                destinationCoords: (isNaN(destinationLat) || isNaN(destinationLng)) ? defaultCoords : { lat: destinationLat, lng: destinationLng },
                truckId: selectedDelivery.truckId,
              };
            })() : null}
          />
        ) : (
          !loading && <div className='no-data'><p className='select-delivery-text'>No pending/active deliveries to show on map.</p></div>
        )}
      </div>
    </div>
  );
};

export default AcceptedDeliveries;
