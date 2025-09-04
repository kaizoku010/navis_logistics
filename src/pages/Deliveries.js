import React, { useEffect, useState, useCallback } from 'react';
import { useDatabase } from '../contexts/DatabaseContext';
import { useAuth } from '../contexts/AuthContext';
import Modal from 'react-modal';
import { GoogleMap, Marker, DirectionsService, DirectionsRenderer, useJsApiLoader } from '@react-google-maps/api';
import './deliver.css';

Modal.setAppElement('#root');

const containerStyle = {
  width: '100%',
  height: '60vh'
};

const API_KEY = 'AIzaSyAy4-wGmH9U6le-7lCL9rm0N2nxxBsNWi0'; // Your API Key

function Deliveries() {
  const { 
    nonUserDeliveries, 
    loading, 
    fetchNonUserDeliveriesFromAPI, 
    updateDeliveryStatusInAPI 
  } = useDatabase();
  const { user } = useAuth();
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [notification, setNotification] = useState('');
  
  useEffect(() => {
    fetchNonUserDeliveriesFromAPI();
  }, [fetchNonUserDeliveriesFromAPI]);

  const filteredDeliveries = nonUserDeliveries?.filter(req => req.company === user.company && req?.status === "pending");

  const handleAcceptDelivery = async () => {
    if (selectedDelivery) {
      await updateDeliveryStatusInAPI(selectedDelivery.uid, "accepted");
      setNotification('Delivery accepted successfully!');
      setTimeout(() => setNotification(''), 3000); // Clear the notification after 3 seconds
      closeModal();
      await fetchNonUserDeliveriesFromAPI();
    }
  };

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: API_KEY,
    libraries: ['places']
  });

  const handleDirectionsCallback = useCallback((response) => {
    if (response && response.status === 'OK') {
      setDirectionsResponse(response);
    } else {
      console.error('Directions request failed due to', response ? response.status : 'no response');
    }
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  const handleDeliveryClick = (delivery) => {
    const convertedDelivery = {
      ...delivery,
      pickupCoords: {
        lat: Number(delivery.pickupCoords.lat.N),
        lng: Number(delivery.pickupCoords.lng.N),
      },
      destinationCoords: {
        lat: Number(delivery.destinationCoords.lat.N),
        lng: Number(delivery.destinationCoords.lng.N),
      },
    };
    setSelectedDelivery(convertedDelivery);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setDirectionsResponse(null);
  };

  return (
    <div className='deliveries-container'>
      <div className='deliveries_list'>
        <h1 className='del-title'>Deliveries</h1>
        {notification && <p className='notification'>{notification}</p>}
        {filteredDeliveries?.length === 0 ? (
          <p className='non-dels'>No deliveries found</p>
        ) : (
          <ul>
            {filteredDeliveries?.map((delivery) => (
              <li className='delivery-item' key={delivery.uid} onClick={() => handleDeliveryClick(delivery)}>
                <h2>{delivery.name}</h2>
                <p>Contact: {delivery.contact}</p>
                <p>Pickup Point: {delivery.pickupPoint}</p>
                <p>Destination: {delivery.destination}</p>
                <p>Car Requested: {delivery.plateNumber}</p>
                <p>Weight: {delivery.weight}</p>
                <p>Status: {delivery.status}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Delivery Map"
        className="modal"
        overlayClassName="overlay"
      >
        <div className='del-map'>
          {selectedDelivery && isLoaded && (
            <GoogleMap
              className="map22"
              mapContainerStyle={containerStyle}
              zoom={16}
              center={selectedDelivery.pickupCoords}
            >
              <Marker position={selectedDelivery.pickupCoords} />
              <Marker position={selectedDelivery.destinationCoords} />
              <DirectionsService
                options={{
                  origin: selectedDelivery.pickupCoords,
                  destination: selectedDelivery.destinationCoords,
                  travelMode: 'DRIVING'
                }}
                callback={handleDirectionsCallback}
              />
              {directionsResponse && (
                <DirectionsRenderer
                  directions={directionsResponse}
                />
              )}
            </GoogleMap>
          )}
          <div className='actions'>
            <button className='ac-d2' onClick={handleAcceptDelivery}>Accept Delivery</button>
            <button onClick={closeModal} className="ac-d">Close</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default Deliveries;
