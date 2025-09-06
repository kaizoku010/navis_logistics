import React, { createContext, useContext, useState } from 'react';
import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

AWS.config.update({
  region: process.env.REACT_APP_AWS_REGION,
  accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
});

const s3 = new AWS.S3();
const dynamoDB = new AWS.DynamoDB.DocumentClient();

const AWSContext = createContext();

export const useAWS = () => useContext(AWSContext);

export const AWSProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null); // User state
  const [trucks, setTrucks] = useState([]);
  const [allTrucks, setAllTrucks] = useState([]);
  const [requests, setRequest] = useState(); // setRequest is unused
  const [drivers, setDrivers] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [non_user_requests, setNon_user_reqs] = useState()


  const uploadImageToS3 = async (file) => {
    const params = {
      Bucket: 'navisbucketcore',
      Key: `users/${Date.now()}_${file.name}`,
      Body: file,
    };
    const { Location } = await s3.upload(params).promise();
    return Location;
  };


  const fetchDeliveriesFromDynamoDB = async () => {
    setLoading(true);
    try {
      const params = {
        TableName: 'navis_deliveries',
      };
      const { Items } = await dynamoDB.scan(params).promise();
      setDeliveries(Items);
    } catch (error) {
      console.error("Error fetching deliveries:", error.message);
    } finally {
      setLoading(false);
    }
  };


  const fetchNonUSerDeliveries = async () => {
    setLoading(true);
    try {
      const params = {
        TableName: 'non_user_requests',
      };
      const { Items } = await dynamoDB.scan(params).promise();
      setNon_user_reqs(Items);
    } catch (error) {
      console.error("Error fetching deliveries:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const uploadDriverImageToS3 = async (file) => {
    const params = {
      Bucket: 'navisbucketcore',
      Key: `drivers/${Date.now()}_${file.name}`,
      Body: file,
    };
    const { Location } = await s3.upload(params).promise();
    return Location;
  };

  const fetchDriversFromDynamoDB = async () => {
    const params = {
      TableName: 'drivers',
    };
 const data = await dynamoDB.scan(params).promise();
      const filteredDrivers = data.Items.filter(driver => driver.company === user.company);
      setDrivers(filteredDrivers);
  };


  const updateDeliveryStatus = async (uid, status) => {
    const params = {
      TableName: "non_user_requests",
      Key: {
        uid: uid,
      },
      UpdateExpression: "set #st = :s",
      ExpressionAttributeNames: {
        "#st": "status",
      },
      ExpressionAttributeValues: {
        ":s": status,
      },
    };
  
    try {
      await dynamoDB.update(params).promise();
    } catch (error) {
      console.error("Error updating delivery status:", error);
    }
  };
  
  


  const fetchNonRequestFromDynamoDB = async () => {
    setLoading(true);
    try {
      const params = {
        TableName: 'non_user_requests',
      };
      const { Items } = await dynamoDB.scan(params).promise();
    // console.log("list: ", Items)

      setNon_user_reqs(Items);
    } catch (error) {
      console.error("Error fetching non user requests:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const saveNonUserRequets = async (reqData) => {
    setLoading(true);
    try {
      const params = {
        TableName: 'non_user_requests',
        Item: {
          uid: uuidv4(),
          ...reqData,
        },
      };
      await dynamoDB.put(params).promise();
    } catch (error) {
      console.error("Error saving request data:", error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };



  const saveDriverDataToDynamoDB = async (driverData) => {
    setLoading(true);
    try {
      const params = {
        TableName: 'drivers',
        Item: {
          ...driverData,
        },
      };
      await dynamoDB.put(params).promise();
    } catch (error) {
      console.error("Error saving driver data:", error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };


  
  const uploadTrackToS3 = async (file) => {
    const params = {
      Bucket: 'navisbucketcore',
      Key: `tracks/${Date.now()}_${file.name}`,
      Body: file,
    };
    const { Location } = await s3.upload(params).promise();
    return Location;
  };

  const saveTruckDataToDynamoDB = async (truckData) => {
    setLoading(true);
    try {
      const params = {
        TableName: 'navis_trucks',
        Item: {
          ...truckData,
          speed: truckData.speed // Save the speed property

        },
      };
      await dynamoDB.put(params).promise();
      console.log("Truck data saved successfully with uid:", truckData.uid);
    } catch (error) {
      console.error("Error saving truck data:", error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  

  const fetchTrucksFromDynamoDB = async () => {
   
    setLoading(true);
    try {
    const params = {
      TableName: 'navis_trucks',
    };
    const { Items } = await dynamoDB.scan(params).promise();

    const normalizedTrucks = Items.map(truck => {
      // Ensure load is a number
      const normalizedLoad = Number(truck.load) || 0;
      return {
        ...truck,
        load: normalizedLoad,
      };
    });

    const filteredTrucks = normalizedTrucks.filter(truck => truck.company === user.company);
    setTrucks(filteredTrucks);
    setLoading(false);
  } catch (error) {
    console.error("Error fetching trucks:", error);
    setLoading(false);
    throw error;
  }
  };


  const fetchAllTrucks = async () => {
    const params = {
      TableName: 'navis_trucks',
    };
    const { Items } = await dynamoDB.scan(params).promise();
        setAllTrucks(Items);
  };


  const saveUserDataToDynamoDB = async (userData) => {
    const params = {
      TableName: 'navis_users',
      Item: {
        uid: uuidv4(),
        ...userData,
      },
    };
    await dynamoDB.put(params).promise();
  };

  const loginUser = async (username, password) => {
    setLoading(true);
    try {
      const user = await fetchUserFromDynamoDB(username);
      setUser(user);

      return user && user.password === password ? user : null;

    } finally {
      setLoading(false);
    }
  };

  const fetchUserFromDynamoDB = async (username) => {
    const params = {
      TableName: 'navis_users',
      FilterExpression: 'username = :username',
      ExpressionAttributeValues: { ':username': username },
    };
    const { Items } = await dynamoDB.scan(params).promise();
    return Items.length > 0 ? Items[0] : null;
  };

  const registerUser = async (username, email, company, password, accountType, imageFile) => {
    setLoading(true);
    try {
      const imageUrl = await uploadImageToS3(imageFile);
      const userData = { username, email, company, password, accountType, imageUrl };
      await saveUserDataToDynamoDB(userData);
    } finally {
      setLoading(false);
    }
  };

  const logoutUser = () => {
    setUser(null); // Clear the user state
  };


  const saveAssignmentToDynamoDB = async (assignmentData) => {
    setLoading(true);
    try {
      const params = {
        TableName: 'truck_driver_assignments',
        Item: {
          ...assignmentData,
        },
      };
      await dynamoDB.put(params).promise();
      console.log("Assignment data saved successfully with uid:", assignmentData.uid);
    } catch (error) {
      console.error("Error saving assignment data:", error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };


  const fetchAssignmentsFromDynamoDB = async () => {
    const params = {
      TableName: 'truck_driver_assignments',
    };
    const { Items } = await dynamoDB.scan(params).promise();
    setAssignments(Items);
  };


  return (
    <AWSContext.Provider value={{  
      fetchDeliveriesFromDynamoDB, 
      deliveries,
      assignments,
      allTrucks,
      fetchAllTrucks,
      fetchAssignmentsFromDynamoDB,
      saveNonUserRequets, 
      requests, 
      fetchNonRequestFromDynamoDB,
      non_user_requests, 
      fetchNonUSerDeliveries, 
      updateDeliveryStatus,
      saveAssignmentToDynamoDB,
      fetchTrucksFromDynamoDB,  // Keep only one instance
      fetchDriversFromDynamoDB, 
      saveDriverDataToDynamoDB, 
      uploadDriverImageToS3, 
      loading, 
      drivers,
      saveTruckDataToDynamoDB,
      registerUser, 
      loginUser, 
      logoutUser, 
      uploadTrackToS3, 
      uploadImageToS3, 
      trucks, 
      user  // Keep only one instance
    }}>
      {children}
    </AWSContext.Provider>
  );
};
