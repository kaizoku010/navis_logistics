import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
    const [deliveriesLoading, setDeliveriesLoading] = useState(false);

    const fetchDriversFromAPI = useCallback(() => {
        setLoading(true);
        const unsubscribe = firebaseClient.listenToCollection('drivers', (data) => {
            setDrivers(data);
            setLoading(false);
        });
        return unsubscribe; // Return unsubscribe function
    }, []);

    const saveDriverDataToAPI = useCallback(async (driverData) => {
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
    }, []);

    const fetchTrucksFromAPI = useCallback(() => {
        setLoading(true);
        const unsubscribe = firebaseClient.listenToCollection('trucks', (data) => {
            setTrucks(data);
            setLoading(false);
        });
        return unsubscribe; // Return unsubscribe function
    }, []);

    const saveTruckDataToAPI = useCallback(async (truckData) => {
        setLoading(true);
        // Add default values for new fields if not provided
        const dataToSave = {
            ...truckData,
            status: truckData.status || 'available', // Default status
            currentDriverId: truckData.currentDriverId || null,
            currentDeliveryId: truckData.currentDeliveryId || null,
        };
        // Determine if it's an update or a new addition
        const documentId = truckData.uid || null; // Use uid as documentId if it exists
        const result = await firebaseClient.saveToFirestore('trucks', dataToSave, documentId);
        setLoading(false);
        return result;
    }, []);

    const fetchAllTrucksFromAPI = useCallback(async () => {
        setLoading(true);
        try {
            const result = await firebaseClient.getFromFirestore('trucks');
            console.log("fetchAllTrucksFromAPI - result from getFromFirestore:", result);
            if (Array.isArray(result)) {
                setAllTrucks(result);
            } else {
                console.error("fetchAllTrucksFromAPI: result is not an array", result);
            }
        } catch (error) {
            console.error("Error fetching all trucks:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchAssignmentsFromAPI = useCallback(async () => {
        setLoading(true);
        const result = await firebaseClient.getFromFirestore('assignments');
        if (Array.isArray(result)) {
            setAssignments(result);
        }
        setLoading(false);
    }, []);

    const saveAssignmentToAPI = useCallback(async (assignmentData) => {
        setLoading(true);
        const result = await firebaseClient.saveToFirestore('assignments', assignmentData);
        setLoading(false);
        return result;
    }, []);

    const fetchDeliveriesFromAPI = useCallback(() => {
        setDeliveriesLoading(true);
        const unsubscribe = firebaseClient.listenToCollection('deliveries', (data) => {
            setDeliveries(data);
            setDeliveriesLoading(false);
        });
        return unsubscribe; // Return unsubscribe function
    }, []);

    const saveDeliveryToAPI = useCallback(async (deliveryData) => {
        setLoading(true);
        const result = await firebaseClient.saveToFirestore('deliveries', deliveryData);
        setLoading(false);
        return result;
    }, []);

    const fetchNonUserDeliveriesFromAPI = useCallback(async () => {
        setLoading(true);
        try {
            const result = await firebaseClient.getFromFirestore('non_user_requests');
            if (Array.isArray(result)) {
                setNonUserDeliveries(result);
            } else {
                console.error("fetchNonUserDeliveriesFromAPI: result is not an array", result);
            }
        } catch (error) {
            console.error("Error fetching non-user deliveries:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    const saveNonUserRequestToAPI = useCallback(async (requestData) => {
        setLoading(true);
        const result = await firebaseClient.saveToFirestore('non_user_requests', requestData);
        setLoading(false);
        return result;
    }, []);

    const updateDeliveryStatusInAPI = useCallback(async (deliveryId, status) => {
        setLoading(true);
        const result = await firebaseClient.updateInFirestore('non_user_requests', deliveryId, { status });
        setLoading(false);
        return result;
    }, []);

    const updateDriverLocationInAPI = useCallback(async (driverId, latitude, longitude, status) => {
        setLoading(true);
        const result = await firebaseClient.updateInFirestore('drivers', driverId, {
            currentLatitude: latitude,
            currentLongitude: longitude,
            status: status || 'on_duty' // Default to 'on_duty' if status not provided
        });
        setLoading(false);
        return result;
    }, []);

    const updateDeliveryStatusForDeliveryCollectionInAPI = useCallback(async (deliveryId, status, acceptedBy, truckId, driverId, startTime = null, endTime = null, totalDuration = null) => {
        setLoading(true);
        const dataToUpdate = {
            status,
            acceptedBy,
            truckId,
            driverId,
            ...(startTime && { startTime }),
            ...(endTime && { endTime }),
            ...(totalDuration && { totalDuration }),
        };

        const result = await firebaseClient.updateInFirestore('deliveries', deliveryId, dataToUpdate);

        // Update driver's currentTruckId and currentDeliveryId when delivery starts or is accepted
        if (driverId && (status === 'in_transit' || status === 'accepted')) { // Assuming 'accepted' is also a state where truck is assigned
            try {
                await firebaseClient.updateInFirestore('drivers', driverId, {
                    currentTruckId: truckId,
                    currentDeliveryId: deliveryId,
                    status: 'on_delivery' // Update driver status
                });
            } catch (error) {
                console.error("Error updating driver's current truck/delivery ID:", error);
            }
        } else if (driverId && status === 'delivered') {
            // When delivery is delivered, clear currentTruckId and currentDeliveryId from driver
            try {
                await firebaseClient.updateInFirestore('drivers', driverId, {
                    currentTruckId: null,
                    currentDeliveryId: null,
                    status: 'available' // Update driver status
                });
            } catch (error) {
                console.error("Error clearing driver's current truck/delivery ID:", error);
            }
        }


        // If delivery is marked as 'delivered', add it to driver's pastDeliveries
        if (status === 'delivered' && driverId) {
            try {
                // Fetch the delivery details to store a summary in pastDeliveries
                const deliveryDoc = await firebaseClient.getFromFirestore('deliveries', deliveryId);
                if (deliveryDoc) {
                    const pastDeliverySummary = {
                        id: deliveryDoc.id,
                        name: deliveryDoc.name,
                        pickupPoint: deliveryDoc.pickupPoint,
                        destination: deliveryDoc.destination,
                        deliveryDate: new Date().toISOString(), // Store completion date
                        totalDuration: totalDuration || null, // Include totalDuration
                        // Add other relevant fields for summary display
                    };
                    await firebaseClient.updateInFirestore('drivers', driverId, {
                        pastDeliveries: firebaseClient.firestore.FieldValue.arrayUnion(pastDeliverySummary)
                    });
                }
            } catch (error) {
                console.error("Error updating driver's past deliveries:", error);
            }
        }

        setLoading(false);
        return result;
    }, []);

    const declineDelivery = useCallback(async (deliveryId, companyId) => {
        setLoading(true);
        const result = await firebaseClient.updateInFirestore('deliveries', deliveryId, {
            declinedBy: firebaseClient.firestore.FieldValue.arrayUnion(companyId)
        });
        setLoading(false);
        return result;
    }, []);

    const deleteDriver = useCallback(async (driverId) => {
        setLoading(true);
        const result = await firebaseClient.deleteFromFirestore('drivers', driverId);
        setLoading(false);
        return result;
    }, []);

    const deleteTruck = useCallback(async (truckId) => {
        setLoading(true);
        const result = await firebaseClient.deleteFromFirestore('trucks', truckId);
        setLoading(false);
        return result;
    }, []);

    const updateDriver = useCallback(async (driverId, driverData) => {
        setLoading(true);
        const result = await firebaseClient.updateInFirestore('drivers', driverId, driverData);
        setLoading(false);
        return result;
    }, []);
    
    useEffect(() => {
        const unsubscribeDrivers = fetchDriversFromAPI();
        const unsubscribeTrucks = fetchTrucksFromAPI();
        const unsubscribeDeliveries = fetchDeliveriesFromAPI();

        return () => {
            unsubscribeDrivers();
            unsubscribeTrucks();
            unsubscribeDeliveries();
        };
    }, [fetchDriversFromAPI, fetchTrucksFromAPI, fetchDeliveriesFromAPI]); 

    const value = {
        drivers,
        trucks,
        allTrucks,
        assignments,
        deliveries,
        nonUserDeliveries,
        loading,
        deliveriesLoading,
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
        declineDelivery, // Added
        deleteDriver,
        deleteTruck,
        updateDriver
    };

    return (
        <DatabaseContext.Provider value={value}>
            {children}
        </DatabaseContext.Provider>
    );
};