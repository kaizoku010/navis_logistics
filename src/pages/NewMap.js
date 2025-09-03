import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { GoogleMap, DirectionsService, DirectionsRenderer, Marker } from '@react-google-maps/api';
import './maps.css';

function NewMap({ pickupCoords, destinationCoords }) {
  const [directions, setDirections] = useState(null);
  const mapRef = useRef(null);

  const directionsRequest = useMemo(() => ({
    origin: pickupCoords,
    destination: destinationCoords,
    travelMode: 'DRIVING',
  }), [pickupCoords, destinationCoords]);

  const directionsCallback = useCallback((response) => {
    if (response && response.status === 'OK') {
      setDirections(response);
    }
  }, []);

  useEffect(() => {
    if (pickupCoords && destinationCoords && mapRef.current) {
      const bounds = new window.google.maps.LatLngBounds();
      bounds.extend(pickupCoords);
      bounds.extend(destinationCoords);
      mapRef.current.fitBounds(bounds);
    }
  }, [pickupCoords, destinationCoords, directions]);

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
        center={pickupCoords || { lat: -34.397, lng: 150.644 }}
        zoom={10}
        options={mapOptions}
        onLoad={(map) => (mapRef.current = map)}
      >
        {pickupCoords && <Marker position={pickupCoords} />}
        {destinationCoords && <Marker position={destinationCoords} />}
        {pickupCoords && destinationCoords && (
          <DirectionsService
            options={directionsRequest}
            callback={directionsCallback}
          />
        )}
        {directions && (
          <DirectionsRenderer
            directions={directions}
            // options={{
            //   suppressMarkers: true,
            // }}
          />
        )}
      </GoogleMap>
    </div>
  );
}

export default NewMap;
