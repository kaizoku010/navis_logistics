import React, { useEffect, useState } from 'react';
import { useDatabase } from '../contexts/DatabaseContext';
import { useAuth } from '../contexts/AuthContext';
import DeliveryTrackingMap from './DeliveryTrackingMap'; // NEW unique map component
import './accepted_deliveries.css';
import { Card, List, Button, Pagination, Spin, Descriptions, Tabs, Badge, Tag } from 'antd';
import { 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  SyncOutlined, 
  CloseCircleOutlined,
  EnvironmentOutlined 
} from '@ant-design/icons';

const AcceptedDeliveries = () => {
  const { deliveries, trucks, assignments, loading, fetchDeliveriesFromAPI, fetchTrucksFromAPI, fetchAssignmentsFromAPI } = useDatabase();
  const { user } = useAuth();
  const [allRoutesData, setAllRoutesData] = useState([]);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [activeTab, setActiveTab] = useState('all');

  // Filter deliveries by status
  const filterDeliveriesByStatus = (status) => {
    if (status === 'all') return allRoutesData;
    if (status === 'accepted') return allRoutesData.filter(d => d.status === 'accepted');
    if (status === 'pending') return allRoutesData.filter(d => d.status === 'pending');
    if (status === 'ongoing') return allRoutesData.filter(d => d.status === 'active' || d.status === 'in_transit' || d.status === 'assigned');
    if (status === 'completed') return allRoutesData.filter(d => d.status === 'completed' || d.status === 'delivered');
    if (status === 'failed') return allRoutesData.filter(d => d.status === 'failed' || d.status === 'cancelled' || d.status === 'declined');
    return allRoutesData;
  };

  const filteredDeliveries = filterDeliveriesByStatus(activeTab);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredDeliveries.slice(indexOfFirstItem, indexOfLastItem);

  // Count deliveries by status
  const acceptedCount = allRoutesData.filter(d => d.status === 'accepted').length;
  const pendingCount = allRoutesData.filter(d => d.status === 'pending').length;
  const ongoingCount = allRoutesData.filter(d => d.status === 'active' || d.status === 'in_transit' || d.status === 'assigned').length;
  const completedCount = allRoutesData.filter(d => d.status === 'completed' || d.status === 'delivered').length;
  const failedCount = allRoutesData.filter(d => d.status === 'failed' || d.status === 'cancelled' || d.status === 'declined').length;

  // Fetch all necessary data on component mount
  useEffect(() => {
    fetchDeliveriesFromAPI();
    fetchTrucksFromAPI();
    fetchAssignmentsFromAPI();
  }, []);

  // console.log("user's company: ", typeof(user?.company))
  console.log("user's company: ",user?.company)

  // Filter and prepare all routes data
  useEffect(() => {
    if (!loading && deliveries.length > 0 && trucks.length > 0 && assignments.length > 0) {
      const filteredDeliveries = deliveries.filter(
        (delivery) =>
          delivery.acceptedBy === user.company
      );

      const routes = filteredDeliveries.map((delivery) => {
        const assignment = assignments.find(
          (assign) => assign.deliveryId === delivery.uid
        );
        const truck = assignment ? trucks.find((t) => t.uid === assignment.truckId) : null;

        return {
          ...delivery,
          truckId: truck ? truck.uid : null,
          truckNumberPlate: truck ? truck.numberPlate : null,
          // Add other truck/driver info here as needed for tooltips
        };
      });
      setAllRoutesData(routes);
    }
  }, [loading, deliveries, trucks, assignments, user.company]);

  const handleShowRoute = (delivery) => {
    setSelectedDelivery(delivery);
  };

  // Get status color and icon
  const getStatusTag = (status) => {
    const statusMap = {
      'accepted': { color: 'blue', icon: <CheckCircleOutlined />, text: 'Accepted' },
      'pending': { color: 'orange', icon: <ClockCircleOutlined />, text: 'Pending' },
      'active': { color: 'cyan', icon: <SyncOutlined spin />, text: 'Active' },
      'in_transit': { color: 'cyan', icon: <SyncOutlined spin />, text: 'In Transit' },
      'assigned': { color: 'cyan', icon: <SyncOutlined spin />, text: 'Assigned' },
      'completed': { color: 'green', icon: <CheckCircleOutlined />, text: 'Completed' },
      'delivered': { color: 'green', icon: <CheckCircleOutlined />, text: 'Delivered' },
      'failed': { color: 'red', icon: <CloseCircleOutlined />, text: 'Failed' },
      'cancelled': { color: 'red', icon: <CloseCircleOutlined />, text: 'Cancelled' },
      'declined': { color: 'red', icon: <CloseCircleOutlined />, text: 'Declined' },
    };
    const statusInfo = statusMap[status] || { color: 'default', icon: null, text: status };
    return <Tag color={statusInfo.color} icon={statusInfo.icon}>{statusInfo.text}</Tag>;
  };


  // Tab items
  const tabItems = [
    {
      key: 'all',
      label: <span><Badge count={allRoutesData.length} showZero>All</Badge></span>,
    },
    {
      key: 'accepted',
      label: <span><Badge count={acceptedCount} showZero>Accepted</Badge></span>,
    },
    {
      key: 'pending',
      label: <span><Badge count={pendingCount} showZero>Pending</Badge></span>,
    },
    {
      key: 'ongoing',
      label: <span><Badge count={ongoingCount} showZero>Ongoing</Badge></span>,
    },
    {
      key: 'completed',
      label: <span><Badge count={completedCount} showZero>Completed</Badge></span>,
    },
    {
      key: 'failed',
      label: <span><Badge count={failedCount} showZero>Failed</Badge></span>,
    },
  ];

  return (
    <div className='map_section_div'>
      <div className='accepted_deliveries_list'>
        {loading ? (
          <Spin tip="Loading deliveries..." />
        ) : (
          <>
            <Tabs 
              activeKey={activeTab} 
              onChange={(key) => {
                setActiveTab(key);
                setCurrentPage(1);
              }}
              items={tabItems}
              style={{ marginBottom: '20px' }}
            />
            
            {filteredDeliveries.length === 0 ? (
              <p>No {activeTab} deliveries found</p>
            ) : (
              <>
                <List
                    itemLayout="vertical"
                    dataSource={currentItems}
                    renderItem={delivery => (
                        <List.Item key={delivery.uid}>
                            <Card
                                title={delivery.name}
                                extra={
                                    <Button
                                        type="primary"
                                        icon={<EnvironmentOutlined />}
                                        onClick={() => handleShowRoute(delivery)}
                                    >
                                        Show Route
                                    </Button>
                                }
                            >
                                <Descriptions column={1} size="small">
                                    <Descriptions.Item label="Contact">{delivery.contact}</Descriptions.Item>
                                    <Descriptions.Item label="Status">{getStatusTag(delivery.status)}</Descriptions.Item>
                                    {delivery.truckNumberPlate && (
                                        <Descriptions.Item label="Truck">{delivery.truckNumberPlate}</Descriptions.Item>
                                    )}
                                    <Descriptions.Item label="Pickup">{delivery.pickupPoint}</Descriptions.Item>
                                    <Descriptions.Item label="Destination">{delivery.destination}</Descriptions.Item>
                                </Descriptions>
                            </Card>
                        </List.Item>
                    )}
                />
                <Pagination
                    current={currentPage}
                    pageSize={itemsPerPage}
                    total={filteredDeliveries.length}
                    onChange={(page) => setCurrentPage(page)}
                    showSizeChanger={false}
                    style={{ textAlign: 'center', marginTop: '20px' }}
                />
              </>
            )}
          </>
        )}
      </div>
      <div className="maps-dd">
        {allRoutesData.length > 0 ? (
          <DeliveryTrackingMap
            deliveries={filteredDeliveries}
            selectedDelivery={selectedDelivery}
            onMarkerClick={handleShowRoute}
          />
        ) : (
          !loading && <div className='no-data'><p className='select-delivery-text'>No deliveries to show on map.</p></div>
        )}
      </div>
    </div>
  );
};

export default AcceptedDeliveries;
