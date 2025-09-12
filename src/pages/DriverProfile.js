import React from 'react';
import { useDriverAuth } from '../contexts/DriverAuthContext';
import { Card, Avatar, Descriptions, Tag, Spin, Row, Col, Typography, Divider } from 'antd';
import './driverDashboard.css';

const { Title, Text } = Typography;

function DriverProfile() {
  const { driver } = useDriverAuth();

  if (!driver) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }



  console.log("driver details: ", driver)
  return (
    <div style={{ padding: '20px' }}>
      <Card>
        <Row className='driver-image' gutter={[32, 32]}>
          <Col xs={24} md={8} style={{ textAlign: 'center' }}>
            <Avatar size={150} src={driver.imageUrl} alt="Driver Profile" />
            <Title level={4} style={{ marginTop: '10px' }}>{driver.name}</Title>
            <Text type="secondary">{driver.company}</Text>
            <div>
                <Tag color={driver.status === 'active' ? 'green' : 'red'} style={{ marginTop: '10px' }}>{driver.status}</Tag>
            </div>
          </Col>
          <Col xs={24} md={16}>
            <Title level={4}>Personal Information</Title>
            <Descriptions bordered column={1}>
              <Descriptions.Item label="Email">{driver.email}</Descriptions.Item>
              <Descriptions.Item label="Phone Number">{driver.phoneNumber}</Descriptions.Item>
              <Descriptions.Item label="Age">{driver.age}</Descriptions.Item>
              <Descriptions.Item label="NIN Number">{driver.ninNumber}</Descriptions.Item>
            </Descriptions>
            <Divider />
            <Title level={4}>License & Vehicle Information</Title>
            <Descriptions bordered column={1}>
              <Descriptions.Item label="Permit ID">{driver.permitId}</Descriptions.Item>
              <Descriptions.Item label="Vehicle Type">{driver.vehicleType || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="License Plate">{driver.licensePlate || 'N/A'}</Descriptions.Item>
            </Descriptions>
          </Col>
        </Row>
      </Card>
    </div>
  );
}

export default DriverProfile;