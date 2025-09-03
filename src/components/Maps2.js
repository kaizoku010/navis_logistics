import React, { useState, useCallback } from 'react';
import { GoogleMap, Marker, DirectionsService, DirectionsRenderer } from '@react-google-maps/api';
import './maps2.css';

const containerStyle = {
  width: '100%',
  height: '100%'
};

const Maps2 = ({ pickupCoords, destinationCoords }) => {
  const [directionsResponse, setDirectionsResponse] = useState(null);

  const handleDirectionsCallback = useCallback((response) => {
    if (response && response.status === 'OK') {
      setDirectionsResponse(response);
    } else {
      console.error('Directions request failed due to', response.status);
    }
  }, []);

  return (
    // <LoadScript googleMapsApiKey="AIzaSyAy4-wGmH9U6le-7lCL9rm0N2nxxBsNWi0">
      <GoogleMap
        mapContainerStyle={containerStyle}
        zoom={16}
        center={pickupCoords}
      >
        {pickupCoords && <Marker position={pickupCoords} />}
        {destinationCoords && <Marker position={destinationCoords} />}
        {pickupCoords && destinationCoords && (
          <DirectionsService
            options={{
              origin: pickupCoords,
              destination: destinationCoords,
              travelMode: 'DRIVING'
            }}
            callback={handleDirectionsCallback}
          />
        )}
        {directionsResponse && (
          <DirectionsRenderer
            directions={directionsResponse}
          />
        )}
      </GoogleMap>
    // </LoadScript>
  );
};

export default Maps2;
