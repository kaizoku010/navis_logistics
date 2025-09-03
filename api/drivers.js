// Vercel Serverless Function for Drivers API
import { MongoClient, ServerApiVersion } from 'mongodb';

// MongoDB connection
const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/navis_db';
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

export default async function handler(req, res) {
  try {
    await client.connect();
    const database = client.db('navis_db');
    const collection = database.collection('drivers');
    
    if (req.method === 'GET') {
      const drivers = await collection.find().limit(1000).toArray();
      res.status(200).json(drivers);
    } else if (req.method === 'POST') {
      // Handle driver login
      const { username, password } = req.body;
      const user = await collection.findOne({ name: username });
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      res.status(200).json(user);
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error in drivers API:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await client.close();
  }
}