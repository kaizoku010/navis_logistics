import React from 'react'
import "./transactions.css"
import ItemHolder from "./ItemHolder"

function Transactions() {
  return (
    <div className='lower-card'>
      <h5>Top Transactions {"(5)"}</h5>
      <div className='transactions-holder'>
        {/* add title and and number */}
        <ItemHolder title="Torror Cement" number="250,000,000 UGX" to="Boona Hardware"/>
        <ItemHolder title="Kings Meat Packers" number="31, 500,000 UGX" to="PK Supermarket"/>
        <ItemHolder title="Torror Cement" number="250,000,000 UGX" to="Boona Hardware"/>
        <ItemHolder title="Torror Cement" number="250,000,000 UGX" to="Boona Hardware"/>
        <ItemHolder title="Torror Cement" number="250,000,000 UGX" to="Boona Hardware"/>

      </div>
      </div>
  )
}

export default Transactions