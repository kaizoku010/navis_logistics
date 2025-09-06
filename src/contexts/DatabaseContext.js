
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

    const fetchDriversFromAPI = () => {
        setLoading(true);
        const unsubscribe = firebaseClient.listenToCollection('drivers', (data) => {
            setDrivers(data);
            setLoading(false);
        });
        return unsubscribe; // Return unsubscribe function
    };

    const saveDriverDataToAPI = async (driverData) => {
        setLoading(true);
        // Add default values for new fields if not provided
        const dataToSave = {
            ...driverData,
            currentLatitude: driverData.currentLatitude || null,
            currentLongitude: driverData.currentLongitude || null,
            role:"driver",
            status: driverData.status || 'available', // Default status
            currentTruckId: driverData.currentTruckId || null,
            companyId: driverData.companyId || null, // Ensure companyId is explicitly handled
        };
        const result = await firebaseClient.saveToFirestore('drivers', dataToSave);
        setLoading(false);
        return result;
    };

    const fetchTrucksFromAPI = () => {
        setLoading(true);
        const unsubscribe = firebaseClient.listenToCollection('trucks', (data) => {
            setTrucks(data);
            setLoading(false);
        });
        return unsubscribe; // Return unsubscribe function
    };

    const saveTruckDataToAPI = async (truckData) => {
        setLoading(true);
        // Add default values for new fields if not provided
        const dataToSave = {
            ...truckData,
            status: truckData.status || 'available', // Default status
            currentDriverId: truckData.currentDriverId || null,
            currentDeliveryId: truckData.currentDeliveryId || null,
        };
        const result = await firebaseClient.saveToFirestore('trucks', dataToSave);
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

    const updateDriverLocationInAPI = async (driverId, latitude, longitude, status) => {
        setLoading(true);
        const result = await firebaseClient.updateInFirestore('drivers', driverId, {
            currentLatitude: latitude,
            currentLongitude: longitude,
            status: status || 'on_duty' // Default to 'on_duty' if status not provided
        });
        setLoading(false);
        return result;
    };

    const updateDeliveryStatusForDeliveryCollectionInAPI = async (deliveryId, status) => {
        setLoading(true);
        const result = await firebaseClient.updateInFirestore('deliveries', deliveryId, { status });
        setLoading(false);
        return result;
    };

    const deleteDriver = async (driverId) => {
        setLoading(true);
        const result = await firebaseClient.deleteFromFirestore('drivers', driverId);
        setLoading(false);
        return result;
    };

    const updateDriver = async (driverId, driverData) => {
        setLoading(true);
        const result = await firebaseClient.updateInFirestore('drivers', driverId, driverData);
        setLoading(false);
        return result;
    };
    
    useEffect(() => {
        const unsubscribeDrivers = fetchDriversFromAPI();
        const unsubscribeTrucks = fetchTrucksFromAPI();

        return () => {
            unsubscribeDrivers();
            unsubscribeTrucks();
        };
    }, []); // Empty dependency array to run once on mount and cleanup on unmount

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
        updateDriverLocationInAPI, // Added
        updateDeliveryStatusInAPI,
        updateDeliveryStatusForDeliveryCollectionInAPI, // Corrected
        deleteDriver,
        updateDriver
    };

    return (
        <DatabaseContext.Provider value={value}>
            {children}
        </DatabaseContext.Provider>
    );
};
