import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { firestore } from './firebaseContext';
import { useAuth } from './AuthContext';

const CargoMoverDeliveryContext = createContext();

export const useCargoMoverDeliveries = () => {
  return useContext(CargoMoverDeliveryContext);
};

export const CargoMoverDeliveryProvider = ({ children }) => {
  const { user, loading: userLoading } = useAuth();
  const [companyDeliveries, setCompanyDeliveries] = useState([]);
  const [loadingCompanyDeliveries, setLoadingCompanyDeliveries] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (userLoading) {
      return; // Still loading user auth, do nothing yet
    }

    if (!user?.company) {
      // No user or company ID, clear deliveries and stop loading
      setCompanyDeliveries([]);
      setLoadingCompanyDeliveries(false);
      return;
    }

    setLoadingCompanyDeliveries(true);
    setError(null);

    const deliveriesRef = collection(firestore, 'deliveries');
    const q = query(deliveriesRef, where('company', '==', user.company));

    const unsubscribe = onSnapshot(q,
      (snapshot) => {
        const deliveriesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setCompanyDeliveries(deliveriesData);
        setLoadingCompanyDeliveries(false);
      },
      (err) => {
        console.error("Error listening to company deliveries:", err);
        setError(err.message);
        setLoadingCompanyDeliveries(false);
      }
    );

    return () => unsubscribe();
  }, [user, userLoading]);

  const value = useMemo(() => ({
    companyDeliveries,
    loadingCompanyDeliveries,
    error,
  }), [companyDeliveries, loadingCompanyDeliveries, error]);

  return (
    <CargoMoverDeliveryContext.Provider value={value}>
      {children}
    </CargoMoverDeliveryContext.Provider>
  );
};