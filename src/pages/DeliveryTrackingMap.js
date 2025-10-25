import React, { useState, useCallback } from 'react';
import { GoogleMap, Marker, DirectionsService, DirectionsRenderer, InfoWindow } from '@react-google-maps/api';
import './maps.css';

/**
 * DeliveryTrackingMap - A unique map component for tracking deliveries
 * Shows all deliveries with color-coded markers based on status
 */
function DeliveryTrackingMap({ deliveries, selectedDelivery, onMarkerClick }) {
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [selectedMarker, setSelectedMarker] = useState(null);

  // Get marker icon based on delivery status
  const getMarkerIcon = (status) => {
    const iconMap = {
      'accepted': 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
      'pending': 'http://maps.google.com/mapfiles/ms/icons/orange-dot.png',
      'active': 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
      'in_transit': 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
      'assigned': 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
      'completed': 'http://maps.google.com/mapfiles/ms/icons/purple-dot.png',
      'delivered': 'http://maps.google.com/mapfiles/ms/icons/purple-dot.png',
      'failed': 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
      'cancelled': 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
      'declined': 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
    };
    return iconMap[status] || 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png';
  };

  // Calculate map center based on deliveries
  const getMapCenter = () => {
    if (selectedDelivery) {
      const lat = Number(selectedDelivery.pickupCoords?.lat?.N || selectedDelivery.pickupCoords?.lat);
      const lng = Number(selectedDelivery.pickupCoords?.lng?.N || selectedDelivery.pickupCoords?.lng);
      if (!isNaN(lat) && !isNaN(lng)) {
        return { lat, lng };
      }
    }

    if (deliveries.length > 0) {
      const firstDelivery = deliveries[0];
      const lat = Number(firstDelivery.pickupCoords?.lat?.N || firstDelivery.pickupCoords?.lat);
      const lng = Number(firstDelivery.pickupCoords?.lng?.N || firstDelivery.pickupCoords?.lng);
      if (!isNaN(lat) && !isNaN(lng)) {
        return { lat, lng };
      }
    }

    // Default to Nairobi
    return { lat: -1.286389, lng: 36.817223 };
  };

  // Directions callback
  const directionsCallback = useCallback((response) => {
    if (response && response.status === 'OK') {
      setDirectionsResponse(response);
    }
  }, []);

  const mapContainerStyle = {
    width: '100%',
    height: '100vh',
  };

  const mapOptions = {
    gestureHandling: 'auto',
    zoomControl: true,
    mapTypeControl: true,
    streetViewControl: false,
    fullscreenControl: true,
  };

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={getMapCenter()}
      zoom={12}
      options={mapOptions}
    >
      {/* Render all delivery markers */}
      {deliveries.map((delivery) => {
        const pickupLat = Number(delivery.pickupCoords?.lat?.N || delivery.pickupCoords?.lat);
        const pickupLng = Number(delivery.pickupCoords?.lng?.N || delivery.pickupCoords?.lng);
        const destLat = Number(delivery.destinationCoords?.lat?.N || delivery.destinationCoords?.lat);
        const destLng = Number(delivery.destinationCoords?.lng?.N || delivery.destinationCoords?.lng);

        if (isNaN(pickupLat) || isNaN(pickupLng)) return null;

        return (
          <React.Fragment key={delivery.uid}>
            {/* Pickup Marker */}
            <Marker
              position={{ lat: pickupLat, lng: pickupLng }}
              icon={{
                url: getMarkerIcon(delivery.status),
                scaledSize: new window.google.maps.Size(40, 40),
              }}
              title={`${delivery.name} - Pickup`}
              onClick={() => {
                setSelectedMarker(delivery);
                if (onMarkerClick) onMarkerClick(delivery);
              }}
            />

            {/* Destination Marker */}
            {!isNaN(destLat) && !isNaN(destLng) && (
              <Marker
                position={{ lat: destLat, lng: destLng }}
                icon={{
                  url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
                  scaledSize: new window.google.maps.Size(40, 40),
                }}
                title={`${delivery.name} - Destination`}
                label={{
                  text: '🏁',
                  fontSize: '20px',
                }}
              />
            )}

            {/* Info Window for selected marker */}
            {selectedMarker?.uid === delivery.uid && (
              <InfoWindow
                position={{ lat: pickupLat, lng: pickupLng }}
                onCloseClick={() => setSelectedMarker(null)}
              >
                <div style={{ padding: '10px', maxWidth: '200px' }}>
                  <h3 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>{delivery.name}</h3>
                  <p style={{ margin: '5px 0', fontSize: '12px' }}><strong>Status:</strong> {delivery.status}</p>
                  <p style={{ margin: '5px 0', fontSize: '12px' }}><strong>Pickup:</strong> {delivery.pickupPoint}</p>
                  <p style={{ margin: '5px 0', fontSize: '12px' }}><strong>Destination:</strong> {delivery.destination}</p>
                  {delivery.truckNumberPlate && (
                    <p style={{ margin: '5px 0', fontSize: '12px' }}><strong>Truck:</strong> {delivery.truckNumberPlate}</p>
                  )}
                </div>
              </InfoWindow>
            )}
          </React.Fragment>
        );
      })}

      {/* Show directions for selected delivery */}
      {selectedDelivery && (() => {
        const pickupLat = Number(selectedDelivery.pickupCoords?.lat?.N || selectedDelivery.pickupCoords?.lat);
        const pickupLng = Number(selectedDelivery.pickupCoords?.lng?.N || selectedDelivery.pickupCoords?.lng);
        const destLat = Number(selectedDelivery.destinationCoords?.lat?.N || selectedDelivery.destinationCoords?.lat);
        const destLng = Number(selectedDelivery.destinationCoords?.lng?.N || selectedDelivery.destinationCoords?.lng);

        if (isNaN(pickupLat) || isNaN(pickupLng) || isNaN(destLat) || isNaN(destLng)) {
          return null;
        }

        return (
          <>
            {!directionsResponse && (
              <DirectionsService
                options={{
                  origin: { lat: pickupLat, lng: pickupLng },
                  destination: { lat: destLat, lng: destLng },
                  travelMode: 'DRIVING',
                }}
                callback={directionsCallback}
              />
            )}
            {directionsResponse && (
              <DirectionsRenderer
                options={{
                  directions: directionsResponse,
                  suppressMarkers: true,
                  polylineOptions: {
                    strokeColor: '#2196F3',
                    strokeWeight: 6,
                    strokeOpacity: 0.8,
                  },
                }}
              />
            )}
          </>
        );
      })()}
    </GoogleMap>
  );
}

export default DeliveryTrackingMap;
