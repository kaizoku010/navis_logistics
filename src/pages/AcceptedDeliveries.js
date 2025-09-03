import React, { useEffect, useState } from 'react';
import { useAWS } from '../contexts/MongoContext';
import Maps from './NewMap'; // Adjust the import path as necessary
import './accepted_deliveries.css';
import { Steps, Button } from 'antd';

const AcceptedDeliveries = () => {
  const { fetchNonUserDeliveries, non_user_requests, user } = useAWS();
  const [acceptedDeliveries, setAcceptedDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDelivery, setSelectedDelivery] = useState(null);

  // Fetch deliveries on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchNonUserDeliveries();
        setLoading(false);
      } catch (error) {
        console.error("Error fetching deliveries:", error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter and set accepted deliveries
  useEffect(() => {
    if (!loading && non_user_requests) {
      const filteredDeliveries = non_user_requests.filter(req => req.company === user.company && req.status === "accepted");
      setAcceptedDeliveries(filteredDeliveries);
    }
  }, [loading, non_user_requests, user.company]);

  const handleShowRoute = (delivery) => {
    setSelectedDelivery(delivery);
  };

  return (
    <div className='map_section_div'>
      <div className='accepted_deliveries_list'>
        {loading ? (
          <p>Loading deliveries...</p>
        ) : acceptedDeliveries.length === 0 ? (
          <p>No accepted deliveries found</p>
        ) : (
          <ul>
            {acceptedDeliveries.map(delivery => (
              <li
                key={delivery.uid}
                className='delivery-item'
              >
                <h3 className='del-name'>{delivery.name}</h3>
                <p className='contact-text'>Contact: {delivery.contact}</p>
                <p>Car Requested: {delivery.plateNumber}</p>
                <p>Weight: {delivery.weight}</p>
                <div className='steps'>
                  <Steps
                    progressDot
                    current={1}
                    className='steps'
                    direction="vertical"
                    items={[
                      {
                        title: 'Pickup',
                        description: delivery.pickupPoint,
                      },
                      {
                        title: 'Destination',
                        description: delivery.destination,
                      }
                    ]}
                  />
                </div>
                <Button
                  type="primary"
                  onClick={() => handleShowRoute(delivery)}
                >
                  Show Route
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="maps-dd">
        {selectedDelivery ? (
          <Maps
            pickupCoords={{
              lat: Number(selectedDelivery.pickupCoords.lat.N),
              lng: Number(selectedDelivery.pickupCoords.lng.N),
            }}
            destinationCoords={{
              lat: Number(selectedDelivery.destinationCoords.lat.N),
              lng: Number(selectedDelivery.destinationCoords.lng.N),
            }}
          />
        ) : (
          !loading && <div className='no-data'><p className='select-delivery-text'>start by selecting a delivery to show route and driver status</p></div>
        )}
      </div>
    </div>
  );
};

export default AcceptedDeliveries;
