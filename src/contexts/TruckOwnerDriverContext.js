import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { firestore } from './firebaseContext';
import { useAuth } from './AuthContext';

const TruckOwnerDriverContext = createContext();

export const useTruckOwnerDrivers = () => {
  return useContext(TruckOwnerDriverContext);
};

export const TruckOwnerDriverProvider = ({ children }) => {
  const { user, loading: userLoading } = useAuth();
  const [companyDrivers, setCompanyDrivers] = useState([]);
  const [loadingCompanyDrivers, setLoadingCompanyDrivers] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (userLoading) {
      return; // Still loading user auth, do nothing yet
    }

    if (!user?.company) {
      // No user or company ID, clear drivers and stop loading
      setCompanyDrivers([]);
      setLoadingCompanyDrivers(false);
      return;
    }

    setLoadingCompanyDrivers(true);
    setError(null);

    const driversRef = collection(firestore, 'drivers');
    const q = query(driversRef, where('company', '==', user.company));

    const unsubscribe = onSnapshot(q,
      (snapshot) => {
        const driversData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setCompanyDrivers(driversData);
        setLoadingCompanyDrivers(false);
      },
      (err) => {
        console.error("Error listening to company drivers:", err);
        setError(err.message);
        setLoadingCompanyDrivers(false);
      }
    );

    return () => unsubscribe();
  }, [user, userLoading]);

  const value = useMemo(() => ({
    companyDrivers,
    loadingCompanyDrivers,
    error,
  }), [companyDrivers, loadingCompanyDrivers, error]);

  return (
    <TruckOwnerDriverContext.Provider value={value}>
      {children}
    </TruckOwnerDriverContext.Provider>
  );
};