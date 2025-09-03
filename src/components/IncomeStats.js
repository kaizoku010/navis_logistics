import React from 'react'
import "./incomestates.css"
import { LineChart } from '@mui/x-charts/LineChart';

function IncomeStats() {
  return (
    <div className='lower-card'>
        <div className='income_holder'>
        <h5>Income Statistics</h5>
        <p className='transTextColor '>Total Balance</p>
        <h5 className='transTextColor'>1,2000$</h5>
    <div>
    <LineChart
      skipAnimation={false}
      xAxis={[{ data: [1, 2, 3, 5, 8, 10] }]}
      series={[
        {
            id: 'Income Over Time',
            color:"#aff993",
            label: 'Income Over Time',
          data: [0, 5.5, 4, 5.5, 1.5, 5],
          area: true,

        },
        {
          id: 'Orders Over Time',
          color:"#2e96ff",
          label: 'Orders Over Time',
        data: [0, 3, 1.6, 5, 1.3, 7],
        area: false,

      },
      
      ]}
      width={330}
      height={290}
    />
    </div>
    <h5 className='tt-orders'>Total amount of unfullfilled orders</h5>
    <p className='tt-orders'>200,000ugx</p>

        </div>
    </div>
  )
}

export default IncomeStats