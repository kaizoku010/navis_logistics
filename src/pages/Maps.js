import React, { useState, useEffect, useRef, useCallback } from 'react';
import "./maps.css";
import { GoogleMap, LoadScript, Marker, DirectionsService, DirectionsRenderer } from '@react-google-maps/api';

function Maps({ coordinates }) {

  // console.log("corrds: ", coordinates)
  const API_KEY = "AIzaSyAy4-wGmH9U6le-7lCL9rm0N2nxxBsNWi0";
  const [directions, setDirections] = useState(null);
  const [markers, setMarkers] = useState({ pickup: coordinates.pickup, destination: coordinates.destination });
  const mapRef = useRef(null);

  const directionsCallback = useCallback((response) => {
    if (response && response.status === 'OK') {
      setDirections(response);
    }
  }, []);

  useEffect(() => {
    if (coordinates.pickup && coordinates.destination) {
      setMarkers({ pickup: coordinates.pickup, destination: coordinates.destination });
      setDirections({
        origin: coordinates.pickup,
        destination: coordinates.destination,
        travelMode: 'DRIVING',
      });
    }
  }, [coordinates]);

  const containerStyle = {
    width: '100%',
    height: '100%',
  };

  return (
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={markers.pickup || { lat: -34.397, lng: 150.644 }}
        zoom={8}
        clickableIcons="none"
        onLoad={(map) => (mapRef.current = map)}
      >
        {markers.pickup && <Marker position={markers.pickup} />}
        {markers.destination && <Marker position={markers.destination} />}
        {directions && (
          <DirectionsService
            options={directions}
            callback={directionsCallback}
          />
        )}
        {directions && directions.routes && (
          <DirectionsRenderer directions={directions} />
        )}
      </GoogleMap>
  );
}

export default Maps;
