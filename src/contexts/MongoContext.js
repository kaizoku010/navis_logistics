import React, { createContext, useContext, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import api from '../api/server'; // Import our integrated API

const AWSContext = createContext();

export const useAWS = () => useContext(AWSContext);

export const AWSProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [trucks, setTrucks] = useState([]);
  const [allTrucks, setAllTrucks] = useState([]);
  const [requests, setRequest] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [non_user_requests, setNon_user_reqs] = useState([]);
  const [userDeliveries, setUserDeliveries] = useState([])

  // Remove the external endpoint - we're now using integrated API
  // const endpoint = 'https://navis-api.onrender.com'; 

  const fetchDeliveriesFromAPI = async () => {
    setLoading(true);
    try {
      const data = await api.getDeliveries();
      setDeliveries(data);
    } catch (error) {
      console.error("Error fetching deliveries:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const makeDeliveries = async(reqData)=>{
    setLoading(true)
    try {
      await api.makeDelivery(reqData);
    } catch (error) {
      console.error("Error saving delivery:", error.message);
    } finally {
      setLoading(false);
    }
  }

  const getDeliveries = async()=>{
    setLoading(true);
    try {
      const data = await api.getUserDeliveries();
      setUserDeliveries(data);
    } catch (error) {
      console.error("Error fetching user deliveries:", error.message);
    } finally {
      setLoading(false);
    }
  }

  const fetchNonUserDeliveries = async () => {
    setLoading(true);
    try {
      const data = await api.getNonUserRequests();
      setNon_user_reqs(data);
    } catch (error) {
      console.error("Error fetching non-user requests:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchDriversFromAPI = async () => {
    setLoading(true);
    try {
      const data = await api.getDrivers(user?.company);
      setDrivers(data);
    } catch (error) {
      console.error("Error fetching drivers:", error.message);
    } finally {
      setLoading(false);
    }
  };
  
  const updateDeliveryStatus = async (uid, status) => {
    try {
        await api.updateDeliveryStatus(uid, status);
    } catch (error) {
        console.error("Error updating delivery status:", error);
    }
  };

  // Rewritten assignment code
  const newAssigments = async (uid, plate)=>{
    console.log("driver id: ", uid, "truck number plate: ", plate)
    try {
      await api.updateDriverTruck(uid, plate);
    } catch (error) {
      console.log("error updating driver: ", error)
    }
  }

  const saveNonUserRequests = async (reqData) => {
    setLoading(true);
    try {
      await api.saveNonUserRequest(reqData);
    } catch (error) {
      console.error("Error saving request data:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const saveDriverDataToAPI = async (driverData) => {
    setLoading(true);
    try {
      await api.saveDriverData(driverData);
    } catch (error) {
      console.error("Error saving driver data:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrucksFromAPI = async () => {
    setLoading(true);
    try {
      const data = await api.getTrucks(user?.company);
      setTrucks(data);
    } catch (error) {
      console.error("Error fetching trucks:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllTrucks = async () => {
    setLoading(true);
    try {
      const data = await api.getTrucks();
      setAllTrucks(data);
    } catch (error) {
      console.error("Error fetching all trucks:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignmentsFromDynamoDB = async () => {
    setLoading(true);
    try {
      const data = await api.getNonUserRequests();
      setAssignments(data);
    } catch (error) {
      console.error("Error fetching assignments:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const saveAssignmentToDynamoDB = async (assignmentData) => {
    setLoading(true);
    try {
      await api.assignDriverToTruck(assignmentData.driverId, assignmentData.truckId);
    } catch (error) {
      console.error("Error saving assignment data:", error.message);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const data = await api.getNonUserRequests();
      setAllTrucks(data);
    } catch (error) {
      console.error("Error fetching assignments:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const saveTruckDataToAPI = async (truckData) => {
    setLoading(true);
    try {
      await api.saveTruckData(truckData);
    } catch (error) {
      console.error("Error saving truck data:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const loginUser = async (username, password) => {
    setLoading(true);
    try {
        const userData = await api.login(username, password);
        setUser(userData);
        return userData;
    } catch (error) {
        console.log("login error:", error.message);
        return null;
    } finally {
        setLoading(false);
    }
  };

  // Keep S3 upload as external service for now
  const uploadImageToS3 = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      // This would need to be updated to use a different service or integrated
      // For now, keeping as external call - this needs API endpoint configuration
      const response = await fetch(`https://your-upload-service.com/upload`, {
        method: 'POST',
        body: formData,
        mode:"cors"
      });
      const data = await response.json();
      return data.imageUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  };

  const registerUser = async (username, email, company, password, accountType, imageUrl) => {
    setLoading(true);
    try {
      const userData = { username, email, company, password, accountType, imageUrl };
      await api.register(userData);
      setUser(userData);
    } catch (error) {
      console.error("Error registering user:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    loading,
    user,
    trucks,
    allTrucks,
    requests,
    drivers,
    assignments,
    deliveries,
    non_user_requests,
    fetchDeliveriesFromAPI,
    getDeliveries,
    makeDeliveries,
    userDeliveries,
    fetchNonUserDeliveries,
    fetchDriversFromAPI,
    updateDeliveryStatus,
    saveNonUserRequests,
    saveDriverDataToAPI,
    fetchTrucksFromAPI,
    fetchAllTrucks,
    saveTruckDataToAPI,
    loginUser,
    fetchAssignments,
    registerUser,
    fetchAssignmentsFromDynamoDB,
    saveAssignmentToDynamoDB,
    uploadImageToS3,
    newAssigments
  };

  return <AWSContext.Provider value={value}>{children}</AWSContext.Provider>;
};