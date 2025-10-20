
import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { auth, firestore } from './firebaseContext';
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const register = useCallback(async (email, password, username, company, accountType, imageUrl) => {
        setLoading(true);
        try {
            const { user } = await createUserWithEmailAndPassword(auth, email, password);
            const companyId = company.toLowerCase().replace(/\s/g, '-');
            await setDoc(doc(firestore, "users", user.uid), {
                username,
                company,
                companyId,
                accountType,
                imageUrl
            });
            return user;
        } catch (error) {
            console.error("Error during registration:", error);
            throw error; // Re-throw the error to be caught by the calling function
        } finally {
            setLoading(false);
        }
    }, []);

    const login = useCallback(async (email, password) => {
        setLoading(true);
        try {
            const { user } = await signInWithEmailAndPassword(auth, email, password);
            const userDoc = await getDoc(doc(firestore, "users", user.uid));
            return { ...user, ...userDoc.data() };
        } finally {
            setLoading(false);
        }
    }, []);

    const driverLogin = useCallback(async (email, password) => {
        setLoading(true);
        try {
            const driversRef = collection(firestore, "drivers");
            const q = query(driversRef, where("email", "==", email), where("password", "==", password));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const driverDoc = querySnapshot.docs[0];
                const driverData = { id: driverDoc.id, ...driverDoc.data() };
                // Ensure accountType is set for ProtectedRoute
                setUser({ ...driverData, accountType: driverData.role || 'driver' }); 
                return driverData;
            } else {
                throw new Error("Invalid driver credentials");
            }
        } catch (error) {
            console.error("Error during driver login:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    const logout = useCallback(() => {
        return signOut(auth);
    }, []);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                
                const userDoc = await getDoc(doc(firestore, "users", user.uid));
                setUser({ ...user, ...userDoc.data() });
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value = useMemo(() => ({
        user,
        loading,
        setLoading,
        register,
        login,
        logout
    }), [user, loading, register, login, logout]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};