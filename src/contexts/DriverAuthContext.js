import { createContext, useContext, useState, useEffect } from 'react';
import { firestore } from './firebaseContext';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';

const DriverAuthContext = createContext();

export function DriverAuthProvider({ children }) {
  const [driver, setDriver] = useState(() => {
    const saved = localStorage.getItem('driverSession');
    return saved ? JSON.parse(saved) : null;
  });
  
  useEffect(() => {
    const fetchDriverData = async () => {
      if (driver && driver.id) {
        try {
          const driverDocRef = doc(firestore, 'drivers', driver.id);
          const driverDocSnap = await getDoc(driverDocRef);
          if (driverDocSnap.exists()) {
            const fetchedDriverData = {
              id: driverDocSnap.id,
              accountType: 'driver',
              ...driverDocSnap.data()
            };
            if (JSON.stringify(fetchedDriverData) !== JSON.stringify(driver)) {
                setDriver(fetchedDriverData);
            }
            localStorage.setItem('driverSession', JSON.stringify(fetchedDriverData));
          } else {
            console.warn("Driver document not found in Firestore.");
            localStorage.removeItem('driverSession');
            setDriver(null);
          }
        } catch (error) {
          console.error("Error fetching driver data from Firestore:", error);
        }
      } else if (!driver) {
        localStorage.removeItem('driverSession');
      }
    };

    fetchDriverData();
  }, [driver?.id]); // Re-run when driver.id changes (e.g., on initial login or logout)

  const driverLogin = async (email, password) => {
    try {
      const driversRef = collection(firestore, 'drivers');
      const q = query(driversRef, 
        where('email', '==', email), 
        where('password', '==', password)
      );
      const snapshot = await getDocs(q);
  
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        // Verify driver account is active
        if(doc.data().status !== 'active' && doc.data().status !== 'available') {
          throw new Error('Driver account disabled');
        }
        const driverData = { 
          id: doc.id, 
          accountType: 'driver',
          ...doc.data() 
        };
        setDriver(driverData);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Driver login error:', error);
      throw error;
    }
  };

  const driverLogout = () => {
    localStorage.removeItem('driverSession');
    setDriver(null);
  };

  return (
    <DriverAuthContext.Provider
      value={{ 
        driver,
        driverLogin,
        driverLogout,
        isAuthenticated: !!driver
      }}
    >
      {children}
    </DriverAuthContext.Provider>
  );
}

export const useDriverAuth = () => useContext(DriverAuthContext);