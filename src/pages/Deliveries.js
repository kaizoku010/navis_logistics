import React, { useEffect, useState, useCallback } from 'react';
import { Layout, Row, Col, List, Card, Button, Spin, message } from 'antd';
import { useDatabase } from '../contexts/DatabaseContext';
import { useAuth } from '../contexts/AuthContext';
import { GoogleMap, Marker, DirectionsService, DirectionsRenderer, useJsApiLoader } from '@react-google-maps/api';
import { Modal as AntdModal } from 'antd'; // Import Ant Design Modal and alias it
import './deliver.css';

const containerStyle = {
  width: '100%',
  height: '60vh'
};

const API_KEY = process.env.REACT_APP_MAPS_API_KEY; // Your API Key

function Deliveries() {
  const { 
    deliveries, 
    deliveriesLoading, 
    fetchDeliveriesFromAPI, 
    updateDeliveryStatusForDeliveryCollectionInAPI 
  } = useDatabase();
  const { user, loading: authLoading } = useAuth();
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [directionsResponse, setDirectionsResponse] = useState(null);
  
  useEffect(() => {
    if (!authLoading && user?.company) {
      fetchDeliveriesFromAPI();
    }
  }, [fetchDeliveriesFromAPI, authLoading, user?.company]);

  const filteredDeliveries = React.useMemo(() => {
    if (!user || !user.company || !deliveries) {
      return []; // Return empty array if user or deliveries are not ready
    }
    return deliveries.filter(req => req?.status === "pending");
  }, [deliveries, user]);

  const handleAcceptDelivery = async () => {
    if (selectedDelivery) {
      await updateDeliveryStatusForDeliveryCollectionInAPI(selectedDelivery.uid, "accepted");
      message.success('Delivery accepted successfully!'); // Use Ant Design message
      closeModal();
      await fetchDeliveriesFromAPI();
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

  if (authLoading) {
    return <div>Loading user data...</div>;
  }

  if (deliveriesLoading) {
    return <div>Loading deliveries...</div>;
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
    <Layout  style={{ padding: '24px', minHeight: '100vh' }}>
      <Row  gutter={[16, 16]}>
        <div className='deliveries-list' span={12}> {/* This column will contain the deliveries list */}
          <Card  title="Deliveries" style={{ marginBottom: 16 }}>
            {filteredDeliveries?.length === 0 ? (
              <p className='non-dels'>No deliveries found</p>
            ) : (
              <List
                itemLayout="vertical"
                size="large"
                dataSource={filteredDeliveries}
                renderItem={delivery => (
                  <List.Item
                    key={delivery.id}
                    onClick={() => handleDeliveryClick(delivery)}
                    style={{ cursor: 'pointer' }}
                  >
                    <List.Item.Meta
                      title={<a>{delivery.name}</a>}
                      description={`Contact: ${delivery.contact}`}
                    />
                    <p>Pickup Point: {delivery.pickupPoint}</p>
                    <p>Destination: {delivery.destination}</p>
                    <p>Car Requested: {delivery.plateNumber}</p>
                    <p>Weight: {delivery.weight}</p>
                    <p>Status: {delivery.status}</p>
                  </List.Item>
                )}
              />
            )}
          </Card>
        </div>
        <Col span={12}> {/* This column will contain the modal content */}
          {/* The Modal will be rendered here, but outside the Col for now, then moved inside Antd Modal */}
        </Col>
      </Row>

      <AntdModal
        title="Delivery Map"
        open={modalIsOpen}
        onCancel={closeModal}
        footer={[
          <Button key="close" onClick={closeModal}>
            Close
          </Button>,
          <Button key="accept" type="primary" onClick={handleAcceptDelivery}>
            Accept Delivery
          </Button>,
        ]}
        width={800}
      >
        <div style={{ height: '60vh', width: '100%' }}>
          {selectedDelivery && isLoaded && (
            <GoogleMap
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
        </div>
      </AntdModal>
    </Layout>
  );
}

export default Deliveries;
