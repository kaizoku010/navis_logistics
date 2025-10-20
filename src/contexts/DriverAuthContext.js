import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { firestore } from './firebaseContext';
import { collection, query, where, getDocs, doc, getDoc, onSnapshot } from 'firebase/firestore';

const DriverAuthContext = createContext();

export function DriverAuthProvider({ children }) {
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);

  // Effect to restore driver session from localStorage on initial mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('driverSession');
      if (saved) {
        const parsedDriver = JSON.parse(saved);
        setDriver(parsedDriver);
      }
    } catch (error) {
      console.error("Failed to parse driver session from localStorage", error);
      localStorage.removeItem('driverSession');
    }
    setLoading(false);
  }, []);

  const driverLogout = useCallback(() => {
    localStorage.removeItem('driverSession');
    setDriver(null);
  }, []);

  // Effect to listen for real-time updates to the driver's document in Firestore
  useEffect(() => {
    if (!driver?.id) {
      // No driver ID, so no document to listen to
      return;
    }

    const driverDocRef = doc(firestore, 'drivers', driver.id);
    const unsubscribe = onSnapshot(driverDocRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const updatedDriverData = { id: snapshot.id, accountType: 'driver', ...snapshot.data() };
          setDriver(updatedDriverData);
          // Also update localStorage to keep it in sync
          localStorage.setItem('driverSession', JSON.stringify(updatedDriverData));
        } else {
          // Document might have been deleted, log out the driver
          console.warn("Driver document no longer exists in Firestore. Logging out.");
          driverLogout();
        }
      },
      (error) => {
        console.error("Error listening to driver document updates:", error);
      }
    );

    // Clean up the listener when the component unmounts or driver.id changes
    return () => unsubscribe();
  }, [driver?.id, driverLogout]); // Depend on driver.id to re-subscribe when driver changes

  const driverLogin = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const driversRef = collection(firestore, 'drivers');
      const q = query(driversRef, where("email", "==", email), where("password", "==", password));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        if(doc.data().status !== 'active' && doc.data().status !== 'available') {
          throw new Error('Driver account disabled');
        }
        const driverData = {
          id: doc.id,
          accountType: 'driver',
          ...doc.data()
        };
        setDriver(driverData);
        localStorage.setItem('driverSession', JSON.stringify(driverData));
        return true;
      }
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const value = useMemo(() => ({
    driver,
    loading,
    driverLogin,
    driverLogout,
    isAuthenticated: !!driver
  }), [driver, loading, driverLogin, driverLogout]);

  return (
    <DriverAuthContext.Provider value={value}>
      {children}
    </DriverAuthContext.Provider>
  );
}

export const useDriverAuth = () => useContext(DriverAuthContext);

export const DriverProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useDriverAuth();
  if (loading) {
    return <div>Loading...</div>;
  }
  if (!isAuthenticated) {
    return <Navigate to="/login-driver" replace />;
  }
  return children;
};
