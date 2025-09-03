// Backend API integrated into frontend
import { MongoClient, ServerApiVersion } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import firebaseAdmin from './firebaseAdmin';

// MongoDB connection setup
const uri = process.env.REACT_APP_MONGO_URI;
let client = null;
let db = null;

const connectToDatabase = async () => {
    if (!client) {
        client = new MongoClient(uri, {
            serverApi: {
                version: ServerApiVersion.v1,
                strict: true,
                deprecationErrors: true,
            },
            ssl: true
        });
        
        try {
            await client.connect();
            await client.db("navis_db").command({ ping: 1 });
            db = client.db('navis_db');
            console.log("Connected to MongoDB");
        } catch (error) {
            console.error("Error connecting to MongoDB:", error);
            throw error;
        }
    }
    return db;
};

// API Functions (replacing Express routes)
const api = {
    // Authentication
    login: async (username, password) => {
        try {
            const database = await connectToDatabase();
            const collection = database.collection('navis_users');
            const user = await collection.findOne({ username: username });
            
            if (!user || user.password !== password) {
                throw new Error('Invalid credentials');
            }
            
            return user;
        } catch (error) {
            console.error("Error logging in:", error.message);
            throw error;
        }
    },

    register: async (userData) => {
        try {
            const { username, email, company, password, accountType, imageUrl } = userData;
            const newUser = { username, email, company, password, accountType, imageUrl };
            const database = await connectToDatabase();
            const collection = database.collection('navis_users');
            await collection.insertOne(newUser);
            return { success: true, message: 'User registered' };
        } catch (error) {
            console.error("Error registering user:", error.message);
            throw error;
        }
    },

    driverLogin: async (username, password) => {
        try {
            const database = await connectToDatabase();
            const collection = database.collection('drivers');
            const user = await collection.findOne({ name: username });
            
            if (!user || user.password !== password) {
                throw new Error('Invalid credentials');
            }
            
            return user;
        } catch (error) {
            console.error("Error logging in driver:", error.message);
            throw error;
        }
    },

    // Data fetching
    getDeliveries: async () => {
        try {
            const database = await connectToDatabase();
            const collection = database.collection('deliveries');
            return await collection.find().limit(1000).toArray();
        } catch (error) {
            console.error("Error fetching deliveries:", error.message);
            throw error;
        }
    },

    getUsers: async () => {
        try {
            const database = await connectToDatabase();
            const collection = database.collection('navis_users');
            return await collection.find().limit(1000).toArray();
        } catch (error) {
            console.error("Error fetching users:", error.message);
            throw error;
        }
    },

    getDrivers: async (company = null) => {
        try {
            const database = await connectToDatabase();
            const collection = database.collection('drivers');
            const query = company ? { company } : {};
            return await collection.find(query).limit(1000).toArray();
        } catch (error) {
            console.error("Error fetching drivers:", error.message);
            throw error;
        }
    },

    getTrucks: async (company = null) => {
        try {
            const database = await connectToDatabase();
            const collection = database.collection('trucks');
            const query = company ? { company } : {};
            return await collection.find(query).limit(1000).toArray();
        } catch (error) {
            console.error("Error fetching trucks:", error.message);
            throw error;
        }
    },

    getNonUserRequests: async () => {
        try {
            const database = await connectToDatabase();
            const collection = database.collection('non_user_requests');
            return await collection.find().limit(1000).toArray();
        } catch (error) {
            console.error("Error fetching non-user requests:", error.message);
            throw error;
        }
    },

    getUserDeliveries: async () => {
        try {
            const database = await connectToDatabase();
            const collection = database.collection('navis_deliveries');
            return await collection.find({}).toArray();
        } catch (error) {
            console.error('Error fetching user deliveries:', error);
            throw error;
        }
    },

    getDriver: async (uid) => {
        try {
            const database = await connectToDatabase();
            const collection = database.collection('drivers');
            const driver = await collection.findOne({ uid: uid });
            
            if (!driver) {
                throw new Error('Driver not found');
            }
            
            return driver;
        } catch (error) {
            console.error("Error fetching driver:", error.message);
            throw error;
        }
    },

    // Data saving/updating
    saveNonUserRequest: async (reqData) => {
        try {
            const database = await connectToDatabase();
            const collection = database.collection('non_user_requests');
            await collection.insertOne({ uid: uuidv4(), ...reqData });
            return { success: true, message: 'Request data saved' };
        } catch (error) {
            console.error("Error saving request data:", error.message);
            throw error;
        }
    },

    makeDelivery: async (reqData) => {
        try {
            const database = await connectToDatabase();
            const collection = database.collection('navis_deliveries');
            await collection.insertOne({ uid: uuidv4(), ...reqData });
            return { success: true, message: 'Delivery data saved' };
        } catch (error) {
            console.error("Error saving delivery data:", error.message);
            throw error;
        }
    },

    saveDriverData: async (driverData) => {
        try {
            const database = await connectToDatabase();
            const collection = database.collection('drivers');
            await collection.insertOne(driverData);
            return { success: true, message: 'Driver data saved' };
        } catch (error) {
            console.error("Error saving driver data:", error.message);
            throw error;
        }
    },

    saveTruckData: async (truckData) => {
        try {
            const database = await connectToDatabase();
            const collection = database.collection('trucks');
            await collection.insertOne(truckData);
            return { success: true, message: 'Truck data saved' };
        } catch (error) {
            console.error("Error saving truck data:", error.message);
            throw error;
        }
    },

    updateDeliveryStatus: async (uid, status) => {
        try {
            const database = await connectToDatabase();
            const collection = database.collection('non_user_requests');
            const result = await collection.updateOne(
                { uid: uid },
                { $set: { status: status } }
            );
            
            if (result.modifiedCount > 0) {
                return { success: true, message: 'Status updated successfully' };
            } else {
                throw new Error('Delivery not found');
            }
        } catch (error) {
            console.error("Error updating delivery status:", error.message);
            throw error;
        }
    },

    updateDriverTruck: async (uid, plate) => {
        try {
            const database = await connectToDatabase();
            const collection = database.collection('drivers');
            const result = await collection.updateOne(
                { uid: uid },
                { $set: { numberPlate: plate } }
            );
            
            if (result.modifiedCount > 0) {
                return { success: true, message: 'Truck updated successfully' };
            } else {
                throw new Error('Driver not found');
            }
        } catch (error) {
            console.error("Error updating driver truck:", error.message);
            throw error;
        }
    },

    // Driver-Truck assignments
    assignDriverToTruck: async (driverId, truckId) => {
        try {
            const database = await connectToDatabase();
            
            // This would need ObjectId import for production
            // For now, we'll use string comparison
            const driver = await database.collection('drivers').findOne({ _id: driverId });
            const truck = await database.collection('trucks').findOne({ _id: truckId });

            if (!driver) {
                throw new Error('Driver not found');
            }

            if (!truck) {
                throw new Error('Truck not found');
            }

            if (driver.truckId && driver.truckId.toString() !== truckId.toString()) {
                throw new Error('Driver is already assigned to another truck');
            }

            if (truck.driverId && truck.driverId.toString() !== driverId.toString()) {
                throw new Error('Truck is already assigned to another driver');
            }

            await database.collection('drivers').updateOne(
                { _id: driverId }, 
                { $set: { truckId: truckId } }
            );
            await database.collection('trucks').updateOne(
                { _id: truckId }, 
                { $set: { driverId: driverId } }
            );

            return { success: true, message: 'Driver assigned to truck successfully' };
        } catch (error) {
            console.error('Error assigning driver to truck:', error.message);
            throw error;
        }
    },

    // Firebase Admin functions
    uploadFile: async (fileBuffer, fileName, folder) => {
        try {
            return await firebaseAdmin.uploadFile(fileBuffer, fileName, folder);
        } catch (error) {
            console.error('Error in uploadFile API:', error.message);
            throw error;
        }
    },

    saveToFirestore: async (collectionName, documentData, documentId) => {
        try {
            return await firebaseAdmin.saveToFirestore(collectionName, documentData, documentId);
        } catch (error) {
            console.error('Error in saveToFirestore API:', error.message);
            throw error;
        }
    },

    getFromFirestore: async (collectionName, documentId) => {
        try {
            return await firebaseAdmin.getFromFirestore(collectionName, documentId);
        } catch (error) {
            console.error('Error in getFromFirestore API:', error.message);
            throw error;
        }
    },

    updateInFirestore: async (collectionName, documentId, updateData) => {
        try {
            return await firebaseAdmin.updateInFirestore(collectionName, documentId, updateData);
        } catch (error) {
            console.error('Error in updateInFirestore API:', error.message);
            throw error;
        }
    },

    deleteFromFirestore: async (collectionName, documentId) => {
        try {
            return await firebaseAdmin.deleteFromFirestore(collectionName, documentId);
        } catch (error) {
            console.error('Error in deleteFromFirestore API:', error.message);
            throw error;
        }
    }
};

// Export for use in other modules
export default api;