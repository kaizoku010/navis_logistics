import { createContext, useContext, useState, useEffect } from 'react';
import { firestore } from './firebaseContext';
import { collection, query, where, getDocs } from 'firebase/firestore';

const DriverAuthContext = createContext();

export function DriverAuthProvider({ children }) {
  const [driver, setDriver] = useState(() => {
    const saved = localStorage.getItem('driverSession');
    return saved ? JSON.parse(saved) : null;
  });
  
  useEffect(() => {
    if(driver) {
      localStorage.setItem('driverSession', JSON.stringify(driver));
    }
  }, [driver]);

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