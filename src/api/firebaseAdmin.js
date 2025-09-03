// Firebase Admin Service for integrated backend - Client-side version
// Note: Firebase Admin SDK is server-side only, so we'll use client-side Firebase instead

// We'll use the client-side Firebase instead of Firebase Admin
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirestore, collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { app } from '../contexts/firebaseContext'; // Import the initialized Firebase app

// Firebase Client Functions (replacing Firebase Admin functionality)
export const firebaseClient = {
  // Storage operations
  uploadFile: async (file, fileName, folder = 'uploads') => {
    try {
      const storage = getStorage(app);
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
      const db = getFirestore(app);
      
      let docRef;
      if (documentId) {
        const docRefInstance = doc(db, collectionName, documentId);
        await updateDoc(docRefInstance, documentData);
        docRef = { id: documentId };
      } else {
        docRef = await addDoc(collection(db, collectionName), documentData);
      }
      
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error(`Error saving to Firestore collection ${collectionName}:`, error.message);
      return { success: false, error: error.message };
    }
  },

  getFromFirestore: async (collectionName, documentId = null) => {
    try {
      const db = getFirestore(app);
      
      if (documentId) {
        const docSnap = await getDoc(doc(db, collectionName, documentId));
        if (!docSnap.exists()) {
          return null;
        }
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        const querySnapshot = await getDocs(collection(db, collectionName));
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      }
    } catch (error) {
      console.error(`Error fetching from Firestore collection ${collectionName}:`, error.message);
      return { success: false, error: error.message };
    }
  },

  updateInFirestore: async (collectionName, documentId, updateData) => {
    try {
      const db = getFirestore(app);
      const docRef = doc(db, collectionName, documentId);
      await updateDoc(docRef, updateData);
      
      return { success: true };
    } catch (error) {
      console.error(`Error updating Firestore document ${documentId} in ${collectionName}:`, error.message);
      return { success: false, error: error.message };
    }
  },

  deleteFromFirestore: async (collectionName, documentId) => {
    try {
      const db = getFirestore(app);
      await deleteDoc(doc(db, collectionName, documentId));
      
      return { success: true };
    } catch (error) {
      console.error(`Error deleting Firestore document ${documentId} from ${collectionName}:`, error.message);
      return { success: false, error: error.message };
    }
  }
};

export default firebaseClient;