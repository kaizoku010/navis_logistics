// src/pages/AddTruck.js
import React, { useState } from 'react';
import axios from 'axios';

function AddTruck() {
  const [email, setEmail] = useState('');
  const [truckDetails, setTruckDetails] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post('http://localhost:5000/api/add-truck', { email, truckDetails })
      .then((response) => {
        console.log('Truck added:', response.data);
      })
      .catch((error) => {
        console.error('Error adding truck:', error);
      });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Truck Details"
        value={truckDetails}
        onChange={(e) => setTruckDetails(e.target.value)}
        required
      />
      <button type="submit">Add Truck</button>
    </form>
  );
}

export default AddTruck;
