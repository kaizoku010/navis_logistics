import React, { useEffect, useState, useCallback } from 'react';
import { Layout, Input, Table, Button, Spin, message, Modal as AntdModal, Tag } from 'antd';
import { useDatabase } from '../contexts/DatabaseContext';
import { useAuth } from '../contexts/AuthContext';
import { GoogleMap, Marker, DirectionsService, DirectionsRenderer, useJsApiLoader } from '@react-google-maps/api';
import './deliver.css';

const { Search } = Input;

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
  const [searchText, setSearchText] = useState('');
  const [filteredStatus, setFilteredStatus] = useState(null);

  useEffect(() => {
    if (!authLoading && user?.company) {
      fetchDeliveriesFromAPI();
    }
  }, [fetchDeliveriesFromAPI, authLoading, user?.company]);

  const filteredDeliveries = React.useMemo(() => {
    if (!user || !user.company || !deliveries) {
      return [];
    }
    let data = deliveries.filter(req => req?.status === "pending");

    if (searchText) {
      data = data.filter(delivery =>
        delivery.name.toLowerCase().includes(searchText.toLowerCase()) ||
        delivery.contact.toLowerCase().includes(searchText.toLowerCase()) ||
        delivery.pickupPoint.toLowerCase().includes(searchText.toLowerCase()) ||
        delivery.destination.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (filteredStatus) {
        data = data.filter(delivery => delivery.status === filteredStatus);
    }

    return data;
  }, [deliveries, user, searchText, filteredStatus]);

  const handleAcceptDelivery = async () => {
    if (selectedDelivery) {
      await updateDeliveryStatusForDeliveryCollectionInAPI(selectedDelivery.uid, "accepted");
      message.success('Delivery accepted successfully!');
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

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Contact',
      dataIndex: 'contact',
      key: 'contact',
    },
    {
      title: 'Pickup Point',
      dataIndex: 'pickupPoint',
      key: 'pickupPoint',
    },
    {
      title: 'Destination',
      dataIndex: 'destination',
      key: 'destination',
    },
    {
        title: 'Car Requested',
        dataIndex: 'plateNumber',
        key: 'plateNumber',
      },
      {
        title: 'Weight',
        dataIndex: 'weight',
        key: 'weight',
      },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: status => (
        <Tag color={status === 'pending' ? 'gold' : 'green'} key={status}>
          {status.toUpperCase()}
        </Tag>
      ),
      filters: [
        { text: 'Pending', value: 'pending' },
        { text: 'Accepted', value: 'accepted' },
      ],
      onFilter: (value, record) => record.status.indexOf(value) === 0,
    },
    {
        title: 'Action',
        key: 'action',
        render: (_, record) => (
          <Button type="primary" onClick={() => handleDeliveryClick(record)}>
            View Details
          </Button>
        ),
      },
  ];

  return (
    <Layout style={{ padding: '24px', minHeight: '100vh' }}>
      <Search
        placeholder="Search deliveries"
        onSearch={value => setSearchText(value)}
        onChange={e => setSearchText(e.target.value)}
        style={{ marginBottom: 16 }}
      />
      <Table
        columns={columns}
        dataSource={filteredDeliveries}
        loading={deliveriesLoading}
        rowKey="uid"
        pagination={{ pageSize: 5 }}
      />

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