import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { firestore } from './firebaseContext';
import { useAuth } from './AuthContext';

const TruckOwnerTruckContext = createContext();

export const useTruckOwnerTrucks = () => {
  return useContext(TruckOwnerTruckContext);
};

export const TruckOwnerTruckProvider = ({ children }) => {
  const { user, loading: userLoading } = useAuth();
  const [companyTrucks, setCompanyTrucks] = useState([]);
  const [loadingCompanyTrucks, setLoadingCompanyTrucks] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (userLoading) {
      return; // Still loading user auth, do nothing yet
    }

    if (!user?.company) {
      // No user or company ID, clear trucks and stop loading
      setCompanyTrucks([]);
      setLoadingCompanyTrucks(false);
      return;
    }

    setLoadingCompanyTrucks(true);
    setError(null);

    const trucksRef = collection(firestore, 'trucks');
    const q = query(trucksRef, where('company', '==', user.company));

    const unsubscribe = onSnapshot(q,
      (snapshot) => {
        const trucksData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setCompanyTrucks(trucksData);
        setLoadingCompanyTrucks(false);
      },
      (err) => {
        console.error("Error listening to company trucks:", err);
        setError(err.message);
        setLoadingCompanyTrucks(false);
      }
    );

    return () => unsubscribe();
  }, [user, userLoading]);

  const value = useMemo(() => ({
    companyTrucks,
    loadingCompanyTrucks,
    error,
  }), [companyTrucks, loadingCompanyTrucks, error]);

  return (
    <TruckOwnerTruckContext.Provider value={value}>
      {children}
    </TruckOwnerTruckContext.Provider>
  );
};