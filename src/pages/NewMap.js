import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleMap, DirectionsService, DirectionsRenderer, Marker } from '@react-google-maps/api';
import { Tooltip } from '@mui/material';
import './maps.css';

function NewMap({ allRoutes, selectedRoute, driverLocations }) {
  const [directionsResponses, setDirectionsResponses] = useState({});
  const mapRef = useRef(null);

  const directionsCallback = useCallback((response, routeId) => {
    if (response && response.status === 'OK') {
      setDirectionsResponses(prev => ({ ...prev, [routeId]: response }));
    }
  }, []);

  useEffect(() => {
    if (mapRef.current && (allRoutes.length > 0 || selectedRoute)) {
      const bounds = new window.google.maps.LatLngBounds();
      let hasBounds = false;

      if (selectedRoute) {
        bounds.extend(selectedRoute.originCoords);
        bounds.extend(selectedRoute.destinationCoords);
        hasBounds = true;
      } else if (allRoutes.length > 0) {
        allRoutes.forEach(route => {
          bounds.extend(route.originCoords);
          bounds.extend(route.destinationCoords);
        });
        hasBounds = true;
      }

      if (hasBounds) {
        mapRef.current.fitBounds(bounds);
      }
    }
  }, [allRoutes, selectedRoute, directionsResponses]);

  const containerStyle = {
    width: '100%',
    height: '100vh',
  };

  const mapOptions = {
    gestureHandling: 'auto',
    draggable: true,
    zoomControl: true,
    scrollwheel: true,
    disableDefaultUI: false,
  };

  return (
    <div className='map_area'>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={selectedRoute?.originCoords || allRoutes[0]?.originCoords || { lat: 1.373333, lng: 32.290275 }}
        zoom={10}
        options={mapOptions}
        onLoad={(map) => (mapRef.current = map)}
      >
        {selectedRoute ? (
          <>
            <Marker position={selectedRoute.originCoords} />
            <Marker position={selectedRoute.destinationCoords} />
          </>
        ) : (
          allRoutes.map((route, index) => (
            <React.Fragment key={route.uid || index}>
              <Marker position={route.pickupCoords} />
              <Marker position={route.destinationCoords} />
            </React.Fragment>
          ))
        )}

        {allRoutes.map((route, index) => (
          <DirectionsService
            key={`${route.uid}-${index}`}
            options={{
              origin: route.originCoords,
              destination: route.destinationCoords,
              travelMode: 'DRIVING',
            }}
            callback={(response) => directionsCallback(response, route.uid)}
          />
        ))}

        {allRoutes.map((route, index) => directionsResponses[route.uid] && (
          <DirectionsRenderer
            key={`${route.uid}-${index}`}
            directions={directionsResponses[route.uid]}
            options={{
              suppressMarkers: true,
              polylineOptions: {
                strokeColor: selectedRoute && selectedRoute.uid === route.uid ? '#FF0000' : '#0000FF',
                strokeOpacity: selectedRoute && selectedRoute.uid === route.uid ? 1.0 : 0.5,
                strokeWeight: selectedRoute && selectedRoute.uid === route.uid ? 6 : 4,
              },
            }}
          />
        ))}

        {driverLocations && driverLocations.map((driver, index) => (
          <Marker
            key={`driver-${index}`}
            position={{ lat: driver.lat, lng: driver.lng }}
            title={driver.title}
            icon={driver.imageUrl ? {
              url: driver.imageUrl,
              scaledSize: new window.google.maps.Size(40, 40),
              anchor: new window.google.maps.Point(20, 20)
            } : {
              url: "https://maps.google.com/mapfiles/ms/icons/man.png",
              scaledSize: new window.google.maps.Size(32, 32),
            }}
          />
        ))}
      </GoogleMap>
    </div>
  );
}

export default NewMap;
