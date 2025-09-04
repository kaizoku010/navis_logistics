
import React, { createContext, useContext, useState, useEffect } from 'react';
import { firebaseClient } from '../api/firebaseAdmin';

const DatabaseContext = createContext();

export const useDatabase = () => {
    return useContext(DatabaseContext);
};

export const DatabaseProvider = ({ children }) => {
    const [drivers, setDrivers] = useState([]);
    const [trucks, setTrucks] = useState([]);
    const [allTrucks, setAllTrucks] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [deliveries, setDeliveries] = useState([]);
    const [nonUserDeliveries, setNonUserDeliveries] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchDriversFromAPI = async () => {
        setLoading(true);
        const result = await firebaseClient.getFromFirestore('drivers');
        if (Array.isArray(result)) {
            setDrivers(result);
        }
        setLoading(false);
    };

    const saveDriverDataToAPI = async (driverData) => {
        setLoading(true);
        const result = await firebaseClient.saveToFirestore('drivers', driverData);
        setLoading(false);
        return result;
    };

    const fetchTrucksFromAPI = async () => {
        setLoading(true);
        const result = await firebaseClient.getFromFirestore('trucks');
        if (Array.isArray(result)) {
            setTrucks(result);
        }
        setLoading(false);
    };

    const saveTruckDataToAPI = async (truckData) => {
        setLoading(true);
        const result = await firebaseClient.saveToFirestore('trucks', truckData);
        setLoading(false);
        return result;
    };

    const fetchAllTrucksFromAPI = async () => {
        setLoading(true);
        const result = await firebaseClient.getFromFirestore('trucks');
        if (Array.isArray(result)) {
            setAllTrucks(result);
        }
        setLoading(false);
    };

    const fetchAssignmentsFromAPI = async () => {
        setLoading(true);
        const result = await firebaseClient.getFromFirestore('assignments');
        if (Array.isArray(result)) {
            setAssignments(result);
        }
        setLoading(false);
    };

    const saveAssignmentToAPI = async (assignmentData) => {
        setLoading(true);
        const result = await firebaseClient.saveToFirestore('assignments', assignmentData);
        setLoading(false);
        return result;
    };

    const fetchDeliveriesFromAPI = async () => {
        setLoading(true);
        const result = await firebaseClient.getFromFirestore('deliveries');
        if (Array.isArray(result)) {
            setDeliveries(result);
        }
        setLoading(false);
    };

    const saveDeliveryToAPI = async (deliveryData) => {
        setLoading(true);
        const result = await firebaseClient.saveToFirestore('deliveries', deliveryData);
        setLoading(false);
        return result;
    };

    const fetchNonUserDeliveriesFromAPI = async () => {
        setLoading(true);
        const result = await firebaseClient.getFromFirestore('non_user_requests');
        if (Array.isArray(result)) {
            setNonUserDeliveries(result);
        }
        setLoading(false);
    };

    const saveNonUserRequestToAPI = async (requestData) => {
        setLoading(true);
        const result = await firebaseClient.saveToFirestore('non_user_requests', requestData);
        setLoading(false);
        return result;
    };

    const updateDeliveryStatusInAPI = async (deliveryId, status) => {
        setLoading(true);
        const result = await firebaseClient.updateInFirestore('non_user_requests', deliveryId, { status });
        setLoading(false);
        return result;
    };
    
    const value = {
        drivers,
        trucks,
        allTrucks,
        assignments,
        deliveries,
        nonUserDeliveries,
        loading,
        fetchDriversFromAPI,
        saveDriverDataToAPI,
        fetchTrucksFromAPI,
        saveTruckDataToAPI,
        fetchAllTrucksFromAPI,
        fetchAssignmentsFromAPI,
        saveAssignmentToAPI,
        fetchDeliveriesFromAPI,
        saveDeliveryToAPI,
        fetchNonUserDeliveriesFromAPI,
        saveNonUserRequestToAPI,
        updateDeliveryStatusInAPI
    };

    return (
        <DatabaseContext.Provider value={value}>
            {children}
        </DatabaseContext.Provider>
    );
};
