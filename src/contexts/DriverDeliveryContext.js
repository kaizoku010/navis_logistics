import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { firestore } from './firebaseContext';
import { useDriverAuth } from './DriverAuthContext';

const DriverDeliveryContext = createContext();

export const useDriverDeliveries = () => {
  return useContext(DriverDeliveryContext);
};

export const DriverDeliveryProvider = ({ children }) => {
  const { driver, loading: driverLoading } = useDriverAuth();
  const [assignedDeliveries, setAssignedDeliveries] = useState([]);
  const [loadingDeliveries, setLoadingDeliveries] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("DriverDeliveryContext: useEffect triggered. driverLoading:", driverLoading, "driver:", driver);
    if (driverLoading) {
      // Still loading driver auth, do nothing yet
      return;
    }

    if (!driver) {
      // No driver logged in, clear deliveries and stop loading
      console.log("DriverDeliveryContext: No driver logged in. Clearing deliveries.");
      setAssignedDeliveries([]);
      setLoadingDeliveries(false);
      return;
    }

    setLoadingDeliveries(true);
    setError(null);
    console.log("DriverDeliveryContext: Setting up listener for driver.id:", driver.id);

    // Set up real-time listener for deliveries assigned to this driver
    const deliveriesRef = collection(firestore, 'deliveries');
    const q = query(deliveriesRef, where('driverId', '==', driver.id));

    const unsubscribe = onSnapshot(q,
      (snapshot) => {
        const deliveriesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        console.log("DriverDeliveryContext: Received deliveries data:", deliveriesData);
        setAssignedDeliveries(deliveriesData);
        setLoadingDeliveries(false);
      },
      (err) => {
        console.error("DriverDeliveryContext: Error listening to driver deliveries:", err);
        setError(err.message);
        setLoadingDeliveries(false);
      }
    );

    // Clean up the listener when the component unmounts or driver changes
    return () => {
      console.log("DriverDeliveryContext: Cleaning up listener.");
      unsubscribe();
    };
  }, [driver, driverLoading]); // Re-run effect if driver or driverLoading changes

  const value = useMemo(() => {
    console.log("DriverDeliveryContext: useMemo re-evaluating. assignedDeliveries count:", assignedDeliveries.length, "loadingDeliveries:", loadingDeliveries);
    return {
      assignedDeliveries,
      loadingDeliveries,
      error,
    };
  }, [assignedDeliveries, loadingDeliveries, error]);

  return (
    <DriverDeliveryContext.Provider value={value}>
      {children}
    </DriverDeliveryContext.Provider>
  );
};