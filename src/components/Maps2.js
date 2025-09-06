import React, { useState, useCallback, useMemo } from 'react';
import { GoogleMap, Marker, DirectionsService, DirectionsRenderer, LoadScript } from '@react-google-maps/api';
import './maps2.css';

const containerStyle = {
  width: '100%',
  height: '100%'
};

const Maps2 = ({ pickupCoords, destinationCoords }) => {
  const [directionsResponse, setDirectionsResponse] = useState(null);

  const memoizedDirectionsOptions = useMemo(() => ({
    origin: pickupCoords,
    destination: destinationCoords,
    travelMode: 'DRIVING'
  }), [pickupCoords, destinationCoords]);

  const handleDirectionsCallback = useCallback((response) => {
    if (response && response.status === 'OK') {
      setDirectionsResponse(response);
    } else {
      console.error('Directions request failed due to', response.status);
    }
  }, []);

  return (
    <LoadScript googleMapsApiKey={process.env.REACT_APP_MAPS_API_KEY}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        zoom={16}
        center={pickupCoords}
      >
        {pickupCoords && <Marker position={pickupCoords} />}
        {destinationCoords && <Marker position={destinationCoords} />}
        {pickupCoords && destinationCoords && (
          <DirectionsService
            options={memoizedDirectionsOptions}
            callback={handleDirectionsCallback}
          />
        )}
        {directionsResponse && (
          <DirectionsRenderer
            directions={directionsResponse}
          />
        )}
      </GoogleMap>
    </LoadScript>
  );
};

export default Maps2;
