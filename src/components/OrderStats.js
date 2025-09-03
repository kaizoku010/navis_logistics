import React from 'react'
import "./orderstats.css"
import ItemHolder from './ItemHolder'
import { PieChart } from '@mui/x-charts/PieChart';

function OrderStats() {
  return (
    <div className='ordersHolder'>
        <div className='lower-card'>
        <h4>Order Statistics</h4>
        <div className='pie-section'>
        <div className='total-order'>
            <p className='number'>2000</p>
            <h5 className='tt-orders'>Total number of orders</h5>
        </div>
        <div className='pie-div'>
        <PieChart
      series={[
        {
          data: [
            { id: 0, value: 10, label: 'Electronics' },
            { id: 1, value: 15, label: 'Food Stuff' },
            { id: 2, value: 20, label: 'Fabric' },
          ],
        },
      ]}
    //   slotProps={{
    //     legend: { hidden: true },
    //   }}
      width={300}
      height={100}

    />
        </div>
        </div>
        <div className='item-cards-orders'>
            <ItemHolder title="Electronics" number="260,000"/>
            <ItemHolder title="Building Materials" number="420,000"/>
            <ItemHolder title="Fabric" number="150,000"/>
            <ItemHolder title="Food Stuff" number="1,201,211"/>
            <ItemHolder title="Medical Items" number="511,020"/>

        </div>
        </div>
        </div>
  )
}

export default OrderStats