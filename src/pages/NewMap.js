import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { GoogleMap, DirectionsService, DirectionsRenderer, Marker } from '@react-google-maps/api';
import { Tooltip } from '@mui/material'; // Import Tooltip
import { useDatabase } from '../contexts/DatabaseContext'; // Import useDatabase
import './maps.css';

function NewMap({ allRoutes, selectedRoute }) {
  const { trucks } = useDatabase(); // Fetch trucks data
  const [directionsResponses, setDirectionsResponses] = useState({}); // Store responses for multiple routes
  const mapRef = useRef(null);

  // Callback for each DirectionsService
  const directionsCallback = useCallback((response, routeId) => {
    if (response && response.status === 'OK') {
      setDirectionsResponses(prev => ({ ...prev, [routeId]: response }));
    }
  }, []);

  // Adjust map bounds to fit all routes or selected route
  useEffect(() => {
    if (mapRef.current && (allRoutes.length > 0 || selectedRoute)) {
      const bounds = new window.google.maps.LatLngBounds();
      let hasBounds = false;

      if (selectedRoute) {
        bounds.extend(selectedRoute.pickupCoords);
        bounds.extend(selectedRoute.destinationCoords);
        hasBounds = true;
      } else if (allRoutes.length > 0) {
        allRoutes.forEach(route => {
          bounds.extend(route.pickupCoords);
          bounds.extend(route.destinationCoords);
        });
        hasBounds = true;
      }

      if (hasBounds) {
        mapRef.current.fitBounds(bounds);
      }
    }
  }, [allRoutes, selectedRoute, directionsResponses]); // Depend on directionsResponses to update bounds after routes load

  const containerStyle = {
    width: '100%',
    height: '100vh',
  };

  const mapOptions = {
    gestureHandling: 'none',
    draggable: true,
    zoomControl: false,
    scrollwheel: false,
    disableDefaultUI: true,
  };

  return (
    <div className='map_area'>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={selectedRoute?.pickupCoords || allRoutes[0]?.pickupCoords || { lat: 1.373333, lng: 32.290275 }} // Center based on selected or first route, default to Uganda
        zoom={10}
        options={mapOptions}
        onLoad={(map) => (mapRef.current = map)}
      >
        {/* Render markers for selected route or all routes */}
        {selectedRoute ? (
          <>
            <Marker position={selectedRoute.pickupCoords} />
            <Marker position={selectedRoute.destinationCoords} />
          </>
        ) : (
          allRoutes.map((route, index) => (
            <React.Fragment key={route.uid || index}> {/* Use uid if available, otherwise index */}
              <Marker position={route.pickupCoords} />
              <Marker position={route.destinationCoords} />
            </React.Fragment>
          ))
        )}

        {/* Render DirectionsService for each route */}
        {allRoutes.map((route, index) => (
          <DirectionsService
            key={`${route.uid}-${index}`}
            options={{
              origin: route.pickupCoords,
              destination: route.destinationCoords,
              travelMode: 'DRIVING',
            }}
            callback={(response) => directionsCallback(response, route.uid)} // Pass route.uid to callback
          />
        ))}

        {/* Render DirectionsRenderer for each route */}
        {allRoutes.map((route, index) => directionsResponses[route.uid] && (
          <DirectionsRenderer
            key={`${route.uid}-${index}`}
            directions={directionsResponses[route.uid]}
            options={{
              suppressMarkers: true, // Suppress default markers as we add our own
              polylineOptions: {
                strokeColor: selectedRoute && selectedRoute.uid === route.uid ? '#FF0000' : '#0000FF', // Highlight selected route
                strokeOpacity: selectedRoute && selectedRoute.uid === route.uid ? 1.0 : 0.5,
                strokeWeight: selectedRoute && selectedRoute.uid === route.uid ? 6 : 4,
              },
            }}
          />
        ))}
      {/* Render Truck Markers */}
        {allRoutes.map(route => {
          const assignedTruck = trucks.find(t => t.uid === route.truckId);
          // Only render marker if truck is assigned and has location data
          if (assignedTruck && assignedTruck.currentLatitude && assignedTruck.currentLongitude) {
            return (
              <Marker
                key={`truck-${assignedTruck.uid}`}
                position={{ lat: assignedTruck.currentLatitude, lng: assignedTruck.currentLongitude }}
                icon={{
                  url: "https://maps.google.com/mapfiles/ms/icons/truck.png", // Generic truck icon
                  scaledSize: new window.google.maps.Size(32, 32),
                }}
              >
                <Tooltip title={`${assignedTruck.numberPlate} - Status: ${assignedTruck.status || 'N/A'}`} arrow>
                  <div /> {/* Tooltip needs a child element */}
                </Tooltip>
              </Marker>
            );
          }
          return null;
        })}
      </GoogleMap>
    </div>
  );
}

export default NewMap;
