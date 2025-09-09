import React, { useEffect, useState, useCallback } from 'react';
import { Layout, Input, Table, Button, message, Modal as AntdModal, Tag, Select } from 'antd';
import { useDatabase } from '../contexts/DatabaseContext';
import { useAuth } from '../contexts/AuthContext';
import { GoogleMap, Marker, DirectionsService, DirectionsRenderer, useJsApiLoader } from '@react-google-maps/api';
import './deliver.css';

const { Search } = Input;
const { Option } = Select;

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
    updateDeliveryStatusForDeliveryCollectionInAPI, 
    declineDelivery: declineDeliveryInDB,
    trucks,
    drivers,
    fetchTrucksFromAPI,
    fetchDriversFromAPI,
    saveAssignmentToAPI,
    updateDriver,
  } = useDatabase();
  const { user, loading: authLoading } = useAuth();
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isAssignModalVisible, setIsAssignModalVisible] = useState(false);
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [filteredStatus, setFilteredStatus] = useState(null);
  const [selectedTruck, setSelectedTruck] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState(null);

  useEffect(() => {
    if (!authLoading && user?.company) {
      fetchDeliveriesFromAPI();
      fetchTrucksFromAPI();
      fetchDriversFromAPI();
    }
  }, [fetchDeliveriesFromAPI, fetchTrucksFromAPI, fetchDriversFromAPI, authLoading, user?.company]);

  const filteredDeliveries = React.useMemo(() => {
    if (!user || !user.company || !deliveries) {
      return [];
    }
    let data = deliveries.filter(req => 
        req?.status === "pending" && 
        (!req.declinedBy || !req.declinedBy.includes(user.companyId))
    );

    if (searchText) {
      data = data.filter(delivery =>
        delivery.name.toLowerCase().includes(searchText.toLowerCase()) ||
        delivery.contact.toLowerCase().includes(searchText.toLowerCase()) ||
        delivery.pickupPoint.toLowerCase().includes(searchText.toLowerCase()) ||
        delivery.destination.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    console.log("deliveries: ", fetchDeliveriesFromAPI);

    if (filteredStatus) {
        data = data.filter(delivery => delivery.status === filteredStatus);
    }

    return data;
  }, [deliveries, user, searchText, filteredStatus]);

  const handleAcceptDelivery = async () => {
    if (selectedDelivery) {
      setIsDetailModalVisible(false);
      setIsAssignModalVisible(true);
    }
  };

  const handleDeclineDelivery = async () => {
    if (selectedDelivery) {
      await declineDeliveryInDB(selectedDelivery.uid, user.companyId);
      message.success('Delivery declined successfully!');
      setIsDetailModalVisible(false);
      fetchDeliveriesFromAPI();
    }
  };

  // console.log("user company found: ", user.company);

  const handleAssign = async () => {
    if (selectedDelivery && selectedTruck && selectedDriver) {
        if(!user.company){
            message.error('User company information is missing.');
            return;
        }
        await updateDeliveryStatusForDeliveryCollectionInAPI(selectedDelivery.id, "active", user.company, selectedTruck, selectedDriver);
        await saveAssignmentToAPI({ deliveryId: selectedDelivery.id, driverId: selectedDriver, truckId: selectedTruck });
        await updateDriver(selectedDriver, { currentTruckId: selectedTruck, currentDeliveryId: selectedDelivery.id });
        message.success('Delivery accepted and assigned successfully!');
        setIsAssignModalVisible(false);
        fetchDeliveriesFromAPI();
    }
  }

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
    const lat = parseFloat(delivery.pickupCoords?.lat);
    const lng = parseFloat(delivery.pickupCoords?.lng);
    const destLat = parseFloat(delivery.destinationCoords?.lat);
    const destLng = parseFloat(delivery.destinationCoords?.lng);

    if (isNaN(lat) || isNaN(lng) || isNaN(destLat) || isNaN(destLng)) {
        message.error("Delivery location is not valid.");
        return;
    }

    const convertedDelivery = {
      ...delivery,
      pickupCoords: {
        lat: lat,
        lng: lng,
      },
      destinationCoords: {
        lat: destLat,
        lng: destLng,
      },
    };
    setSelectedDelivery(convertedDelivery);
    setIsDetailModalVisible(true);
  };

  const closeDetailModal = () => {
    setIsDetailModalVisible(false);
    setDirectionsResponse(null);
  };

  const closeAssignModal = () => {
    setIsAssignModalVisible(false);
  };

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Contact', dataIndex: 'contact', key: 'contact' },
    { title: 'Pickup Point', dataIndex: 'pickupPoint', key: 'pickupPoint' },
    { title: 'Destination', dataIndex: 'destination', key: 'destination' },
    { title: 'Weight', dataIndex: 'weight', key: 'weight' },
    { title: 'Status', dataIndex: 'status', key: 'status', render: status => (<Tag color={status === 'pending' ? 'gold' : 'green'} key={status}>{status.toUpperCase()}</Tag>), filters: [{ text: 'Pending', value: 'pending' }, { text: 'Accepted', value: 'accepted' }], onFilter: (value, record) => record.status.indexOf(value) === 0 },
    { title: 'Action', key: 'action', render: (_, record) => (<Button type="primary" onClick={() => handleDeliveryClick(record)}>View Details</Button>) },
  ];

  const filteredTrucks = trucks.filter(truck => truck.load >= (selectedDelivery?.weight || 0));

  return (
    <Layout style={{ padding: '24px', minHeight: '100vh' }}>
      <Search placeholder="Search deliveries" onSearch={value => setSearchText(value)} onChange={e => setSearchText(e.target.value)} style={{ marginBottom: 16 }} />
      <Table columns={columns} dataSource={filteredDeliveries} loading={deliveriesLoading} rowKey="uid" pagination={{ pageSize: 5 }} />

      <AntdModal title="Delivery Details" open={isDetailModalVisible} onCancel={closeDetailModal} footer={[
          <Button key="decline" danger onClick={handleDeclineDelivery}>Decline</Button>,
          <Button key="accept" type="primary" onClick={handleAcceptDelivery}>Accept Delivery</Button>,
        ]}>
        <div style={{ height: '60vh', width: '100%' }}>
          {selectedDelivery && isLoaded && (
            <GoogleMap mapContainerStyle={containerStyle} zoom={16} center={selectedDelivery.pickupCoords}>
              <Marker position={selectedDelivery.pickupCoords} />
              <Marker position={selectedDelivery.destinationCoords} />
              <DirectionsService options={{ origin: selectedDelivery.pickupCoords, destination: selectedDelivery.destinationCoords, travelMode: 'DRIVING' }} callback={handleDirectionsCallback} />
              {directionsResponse && (<DirectionsRenderer directions={directionsResponse} />)}
            </GoogleMap>
          )}
        </div>
      </AntdModal>

      <AntdModal title="Assign Truck and Driver" open={isAssignModalVisible} onCancel={closeAssignModal} onOk={handleAssign} okText="Assign">
        <Select placeholder="Select a truck" style={{ width: '100%', marginBottom: 16 }} onChange={value => setSelectedTruck(value)}>
            {filteredTrucks.map(truck => (
                <Option key={truck.uid} value={truck.uid}>{truck.make} - {truck.numberPlate}</Option>
            ))}
        </Select>
        <Select placeholder="Select a driver" style={{ width: '100%' }} onChange={value => setSelectedDriver(value)}>
            {drivers.map(driver => (
                <Option key={driver.id} value={driver.id}>{driver.name}</Option>
            ))}
        </Select>
      </AntdModal>
    </Layout>
  );
}

export default Deliveries;