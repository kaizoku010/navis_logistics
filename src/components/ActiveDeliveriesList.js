import React from 'react';
import { List, Typography } from 'antd';
import './ActiveDeliveriesList.css';

const { Text } = Typography;

function ActiveDeliveriesList({ deliveries }) {
  if (!deliveries || deliveries.length === 0) {
    return <div className="no-active-deliveries">No active deliveries</div>;
  }

  return (
    <div className="active-deliveries-list">
      <List
        header={<div>Active Deliveries</div>}
        itemLayout="horizontal"
        dataSource={deliveries}
        renderItem={item => (
          <List.Item>
            <List.Item.Meta
              title={item.name}
              description={
                <>
                  <Text>Status: {item.status}</Text><br/>
                  <Text>Destination: {item.destination}</Text>
                </>
              }
            />
          </List.Item>
        )}
      />
    </div>
  );
}

export default ActiveDeliveriesList;