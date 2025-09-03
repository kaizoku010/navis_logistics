import * as React from 'react';
import { LineChart } from '@mui/x-charts/LineChart';

export default function Graph() {
  return (
<div className='card graphBg'>
      <LineChart
      skipAnimation={false}
      xAxis={[{ data: [1, 2, 3, 5, 8, 10] }]}
      series={[
        {
            id: 'Deliveries over time',
            color:"#ce4406",
            label: 'Deliveries over time',
          data: [2, 5.5, 2, 8.5, 1.5, 5],
          area: true,

        },
        {
          id: 'Requests over time',
          color:"#676afc",
          label: 'Requests over time',
        data: [2.3, 5, 1, 4.5, 1.3, 7],
        area: true,

      },
      ]}
      width={600}
      height={325}
    />
</div>
  


  );
}
