import * as React from 'react';
import { LineChart } from '@mui/x-charts/LineChart';

export default function Graph({ xAxisData = [], deliveriesData = [], requestsData = [] }) {
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
          data: deliveriesData.length === 1 ? [0, deliveriesData[0]] : deliveriesData, // Pad with 0 if only one point
          area: true,

        },
        {
          id: 'Requests over time',
          color:"#676afc",
          label: 'Requests over time',
        data: requestsData.length === 1 ? [0, requestsData[0]] : requestsData, // Pad with 0 if only one point
        area: true,

      },
      ]}
      width={600}
      height={325}
    />
</div>
  


  );
}
