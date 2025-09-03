// Firebase Admin Service for integrated backend
import admin from 'firebase-admin';
import serviceAccount from './serviceAccountKey.json' assert { type: 'json' };

// Initialize Firebase Admin SDK
let firebaseAdminInitialized = false;

const initializeFirebaseAdmin = () => {
  if (!firebaseAdminInitialized) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: `${serviceAccount.project_id}.appspot.com`
      });
      firebaseAdminInitialized = true;
      console.log('Firebase Admin SDK initialized successfully');
    } catch (error) {
      console.error('Error initializing Firebase Admin SDK:', error.message);
    }
  }
  return admin;
};

// Firebase Admin Functions
export const firebaseAdmin = {
  // Storage operations
  uploadFile: async (fileBuffer, fileName, folder = 'uploads') => {
    try {
      initializeFirebaseAdmin();
      const bucket = admin.storage().bucket();
      const fileUpload = bucket.file(`${folder}/${fileName}`);
      
      await fileUpload.save(fileBuffer, {
        metadata: { contentType: 'application/octet-stream' }
      });
      
      // Get download URL
      const [url] = await fileUpload.getSignedUrl({
        action: 'read',
        expires: '03-01-2500' // Far future expiration
      });
      
      return { success: true, url };
    } catch (error) {
      console.error('Error uploading file to Firebase Storage:', error.message);
      throw error;
    }
  },

  // Firestore operations (if needed)
  saveToFirestore: async (collectionName, documentData, documentId = null) => {
    try {
      initializeFirebaseAdmin();
      const db = admin.firestore();
      
      let docRef;
      if (documentId) {
        docRef = db.collection(collectionName).doc(documentId);
        await docRef.set(documentData);
      } else {
        docRef = await db.collection(collectionName).add(documentData);
      }
      
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error(`Error saving to Firestore collection ${collectionName}:`, error.message);
      throw error;
    }
  },

  getFromFirestore: async (collectionName, documentId = null) => {
    try {
      initializeFirebaseAdmin();
      const db = admin.firestore();
      
      if (documentId) {
        const doc = await db.collection(collectionName).doc(documentId).get();
        if (!doc.exists) {
          return null;
        }
        return { id: doc.id, ...doc.data() };
      } else {
        const snapshot = await db.collection(collectionName).get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      }
    } catch (error) {
      console.error(`Error fetching from Firestore collection ${collectionName}:`, error.message);
      throw error;
    }
  },

  updateInFirestore: async (collectionName, documentId, updateData) => {
    try {
      initializeFirebaseAdmin();
      const db = admin.firestore();
      
      const docRef = db.collection(collectionName).doc(documentId);
      await docRef.update(updateData);
      
      return { success: true };
    } catch (error) {
      console.error(`Error updating Firestore document ${documentId} in ${collectionName}:`, error.message);
      throw error;
    }
  },

  deleteFromFirestore: async (collectionName, documentId) => {
    try {
      initializeFirebaseAdmin();
      const db = admin.firestore();
      
      await db.collection(collectionName).doc(documentId).delete();
      
      return { success: true };
    } catch (error) {
      console.error(`Error deleting Firestore document ${documentId} from ${collectionName}:`, error.message);
      throw error;
    }
  }
};

export default firebaseAdmin;