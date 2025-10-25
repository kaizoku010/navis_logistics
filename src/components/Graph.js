import * as React from 'react';
import { LineChart } from '@mui/x-charts/LineChart';

export default function Graph({ xAxisData = [], deliveriesData = [], requestsData = [] }) {
  // Ensure we have valid data
  if (!xAxisData.length || !deliveriesData.length || !requestsData.length) {
    return (
      <div className='card graphBg' style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '325px' }}>
        <p>No data available</p>
      </div>
    );
  }

  return (
<div className='card graphBg'>
      <LineChart
      skipAnimation={false}
      xAxis={[{ data: xAxisData }]}
      series={[
        {
            id: 'Deliveries over time',
            color:"#ce4406",
            label: 'Deliveries over time',
          data: deliveriesData.length === 1 ? [0, deliveriesData[0]] : deliveriesData,
          area: true,
          showMark: true,
        },
        {
          id: 'Requests over time',
          color:"#676afc",
          label: 'Requests over time',
        data: requestsData.length === 1 ? [0, requestsData[0]] : requestsData,
        area: true,
        showMark: true,
      },
      ]}
      width={600}
      height={325}
      margin={{ top: 20, right: 20, bottom: 30, left: 40 }}
    />
</div>
  


  );
}
