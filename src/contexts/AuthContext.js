
import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, firestore } from './firebaseContext';
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

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
            await setDoc(doc(firestore, "users", user.uid), {
                username,
                company,
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

    const logout = () => {
        console.log("Logging out...");
        return signOut(auth);
    };

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

    const value = {
        user,
        loading,
        setLoading, // Add setLoading to the context value
        register,
        login,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
