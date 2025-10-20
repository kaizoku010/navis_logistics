import React, { useState, useEffect } from 'react';
import { useDatabase } from '../contexts/DatabaseContext';
import { useAuth } from '../contexts/AuthContext';
import NewMap from './NewMap';
import { List, Card, Row, Col, Typography, Spin } from 'antd';


const { Title, Text } = Typography;

function DeliveriesEnroute() {
  const { user } = useAuth();
  const { deliveries, drivers, trucks, loading } = useDatabase();
  const [enrouteDeliveries, setEnrouteDeliveries] = useState([]);
  const [selectedDelivery, setSelectedDelivery] = useState(null);

  useEffect(() => {
    if (user && deliveries.length > 0) {
      const filtered = deliveries.filter(d => 
        d.acceptedBy === user.company && (d.status === 'in_transit' || d.status === 'en_route')
      );
      setEnrouteDeliveries(filtered);
      // Set the first delivery as selected by default
      if (filtered.length > 0) {
        setSelectedDelivery(filtered[0]);
      }
    }
  }, [user, deliveries]);

  const getDriverForDelivery = (driverId) => {
    return drivers.find(d => d.id === driverId);
  };

  const getTruckForDelivery = (truckId) => {
    return trucks.find(t => t.id === truckId);
  };

  const mapRoutes = enrouteDeliveries.map(delivery => ({
    uid: delivery.id,
    originCoords: {
      lat: Number(delivery.pickupCoords.lat?.N || delivery.pickupCoords.lat),
      lng: Number(delivery.pickupCoords.lng?.N || delivery.pickupCoords.lng)
    },
    destinationCoords: {
      lat: Number(delivery.destinationCoords.lat?.N || delivery.destinationCoords.lat),
      lng: Number(delivery.destinationCoords.lng?.N || delivery.destinationCoords.lng)
    },
    truckId: delivery.truckId,
  }));

  const driverLocations = enrouteDeliveries.map(delivery => {
    const driver = getDriverForDelivery(delivery.driverId);
    if (driver && driver.currentLatitude && driver.currentLongitude) {
      return {
        lat: driver.currentLatitude,
        lng: driver.currentLongitude,
        title: delivery.name,
        imageUrl: driver.imageUrl
      };
    }
    return null;
  }).filter(Boolean);

  const selectedDriver = selectedDelivery ? getDriverForDelivery(selectedDelivery.driverId) : null;
  const driverLocation = selectedDriver && selectedDriver.currentLatitude && selectedDriver.currentLongitude ? {
    lat: selectedDriver.currentLatitude,
    lng: selectedDriver.currentLongitude,
    imageUrl: selectedDriver.imageUrl
  } : null;

  if (loading) {
    return <Spin size="large" style={{ display: 'block', marginTop: '50px' }} />;
  }

  return (
    <Row gutter={16} style={{ height: '100vh', paddingTop: '20px' }}>
      <Col span={16} style={{ height: '100%' }}>
        <Card title="Live Delivery Map" style={{ height: '100%' }}>
          <NewMap 
            allRoutes={mapRoutes}
            selectedRoute={selectedDelivery ? mapRoutes.find(r => r.uid === selectedDelivery.id) : null}
            driverLocations={driverLocations}
          />
        </Card>
      </Col>
      <Col span={8} style={{ height: '100%', overflowY: 'auto' }}>
        <Card title="Active Deliveries">
          <List
            itemLayout="horizontal"
            dataSource={enrouteDeliveries}
            renderItem={item => {
              const driver = getDriverForDelivery(item.driverId);
              const truck = getTruckForDelivery(item.truckId);
              return (
                <List.Item 
                  onClick={() => setSelectedDelivery(item)}
                  className={selectedDelivery && selectedDelivery.id === item.id ? 'active-delivery-item' : ''}
                >
                  <List.Item.Meta
                    title={<a href="#!">{item.name}</a>}
                    description={
                      <>
                        <Text>Status: {item.status}</Text><br/>
                        <Text>Driver: {driver ? driver.name : 'N/A'}</Text><br/>
                        <Text>Truck: {truck ? truck.numberPlate : 'N/A'}</Text><br/>
                        <Text>Destination: {item.destination}</Text>
                      </>
                    }
                  />
                </List.Item>
              )
            }}
          />
        </Card>
      </Col>
    </Row>
  );
}

export default DeliveriesEnroute;
