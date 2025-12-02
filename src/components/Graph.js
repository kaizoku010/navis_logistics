import * as React from 'react';
import { LineChart } from '@mui/x-charts/LineChart';
import { useRef, useState, useEffect } from 'react';

export default function Graph({ xAxisData = [], deliveriesData = [], requestsData = [] }) {
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 500, height: 280 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth - 20;
        setDimensions({
          width: Math.max(300, width),
          height: 280
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Ensure we have valid data
  if (!xAxisData.length || !deliveriesData.length || !requestsData.length) {
    return (
      <div className='card graphBg' style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '280px' }}>
        <p>No data available</p>
      </div>
    );
  }

  return (
    <div className='card graphBg' ref={containerRef} style={{ width: '100%' }}>
      <LineChart
        skipAnimation={false}
        xAxis={[{ data: xAxisData }]}
        series={[
          {
            id: 'Deliveries over time',
            color: "#ce4406",
            label: 'Deliveries over time',
            data: deliveriesData.length === 1 ? [0, deliveriesData[0]] : deliveriesData,
            area: true,
            showMark: true,
          },
          {
            id: 'Requests over time',
            color: "#676afc",
            label: 'Requests over time',
            data: requestsData.length === 1 ? [0, requestsData[0]] : requestsData,
            area: true,
            showMark: true,
          },
        ]}
        width={dimensions.width}
        height={dimensions.height}
        margin={{ top: 20, right: 20, bottom: 30, left: 40 }}
      />
    </div>
  );
}
