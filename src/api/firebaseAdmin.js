// Firebase Admin Service for integrated backend - Client-side version
// Note: Firebase Admin SDK is server-side only, so we'll use client-side Firebase instead

// We'll use the client-side Firebase instead of Firebase Admin
import {
    storage,
    ref,
    uploadBytes,
    getDownloadURL,
    firestore, // firestore instance from firebaseContext
} from '../contexts/firebaseContext';

import {
    collection,
    addDoc,
    getDocs, // getDocs was missing from the original import list
    doc,
    getDoc,
    updateDoc,
    deleteDoc,
    onSnapshot
} from 'firebase/firestore'; // Correct import path for Firestore functions

// Firebase Client Functions (replacing Firebase Admin functionality)
export const firebaseClient = {
  // Storage operations
  uploadFile: async (file, fileName, folder = 'uploads') => {
    try {
      const storageRef = ref(storage, `${folder}/${fileName}`);
      
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);
      
      return { success: true, url };
    } catch (error) {
      console.error('Error uploading file to Firebase Storage:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Firestore operations
  saveToFirestore: async (collectionName, documentData, documentId = null) => {
    try {
      let docRef;
      if (documentId) {
        const docRefInstance = doc(firestore, collectionName, documentId);
        await updateDoc(docRefInstance, documentData);
        docRef = { id: documentId };
      } else {
        docRef = await addDoc(collection(firestore, collectionName), documentData);
      }
      
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error(`Error saving to Firestore collection ${collectionName}:`, error.message);
      return { success: false, error: error.message };
    }
  },

  getFromFirestore: async (collectionName, documentId = null) => {
    try {
      console.log(`getFromFirestore: Attempting to fetch from collection: ${collectionName}`);
      if (documentId) {
        const docSnap = await getDoc(doc(firestore, collectionName, documentId));
        if (!docSnap.exists()) {
          console.log(`getFromFirestore: Document ${documentId} not found in ${collectionName}`);
          return null;
        }
        const data = { id: docSnap.id, ...docSnap.data() };
        console.log(`getFromFirestore: Document ${documentId} data:`, data);
        return data;
      } else {
        const querySnapshot = await getDocs(collection(firestore, collectionName));
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log(`getFromFirestore: Successfully fetched ${data.length} documents from ${collectionName}:`, data);
        return data;
      }
    } catch (error) {
      console.error(`getFromFirestore: Error fetching from Firestore collection ${collectionName}:`, error.message);
      return { success: false, error: error.message };
    }
  },

  updateInFirestore: async (collectionName, documentId, updateData) => {
    try {
      const docRef = doc(firestore, collectionName, documentId);
      await updateDoc(docRef, updateData);
      
      return { success: true };
    } catch (error) {
      console.error(`Error updating Firestore document ${documentId} in ${collectionName}:`, error.message);
      return { success: false, error: error.message };
    }
  },

  deleteFromFirestore: async (collectionName, documentId) => {
    try {
      console.log(`deleteFromFirestore: Attempting to delete document ${documentId} from collection ${collectionName}`);
      await deleteDoc(doc(firestore, collectionName, documentId));
      console.log(`deleteFromFirestore: Successfully deleted document ${documentId}`);
      return { success: true };
    } catch (error) {
      console.error(`deleteFromFirestore: Error deleting Firestore document ${documentId} from ${collectionName}:`, error.message);
      return { success: false, error: error.message };
    }
  },

  listenToCollection: (collectionName, callback) => {
    const q = collection(firestore, collectionName);
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(data);
    }, (error) => {
      console.error(`Error listening to collection ${collectionName}:`, error.message);
    });
    return unsubscribe;
  }
};

export default firebaseClient;