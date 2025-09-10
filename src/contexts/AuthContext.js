
import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, firestore } from './firebaseContext';
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const register = async (email, password, username, company, accountType, imageUrl) => {
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
    };

    const login = async (email, password) => {
        setLoading(true);
        try {
            const { user } = await signInWithEmailAndPassword(auth, email, password);
            const userDoc = await getDoc(doc(firestore, "users", user.uid));
            return { ...user, ...userDoc.data() };
        } finally {
            setLoading(false);
        }
    };

    const driverLogin = async (email, password) => {
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
    };

    const logout = () => {
        console.log("AuthContext: Logging out...");
        return signOut(auth);
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            // console.log("AuthContext: onAuthStateChanged triggered. User:", user);
            if (user) {
                const userDoc = await getDoc(doc(firestore, "users", user.uid));
                console.log("AuthContext: User document data from Firestore:", userDoc.data());
                setUser({ ...user, ...userDoc.data() });
                console.log("AuthContext: User state set to:", { ...user, ...userDoc.data() });
            } else {
                console.log("AuthContext: No user found. Setting user state to null.");
                setUser(null);
            }
            setLoading(false);
            console.log("AuthContext: Loading set to false.");
        });

        return unsubscribe;
    }, []);

    const value = {
        user,
        loading,
        setLoading, // Add setLoading to the context value
        register,
        login,
        // Remove driverLogin from exposed values
        logout,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};