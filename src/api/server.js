// Backend API integrated into frontend - HTTP client version
// This version maintains compatibility with browser environment
import { v4 as uuidv4 } from 'uuid';

// In a fully integrated solution, we would need to run a separate backend service
// For now, we'll keep the HTTP client approach but make it configurable

// Default to the original external API endpoint
let apiEndpoint = process.env.REACT_APP_API_ENDPOINT || 'https://navis-api.onrender.com';

// API Functions (replacing direct MongoDB calls with HTTP requests)
const api = {
  // Set custom endpoint (useful for local development)
  setEndpoint: (endpoint) => {
    apiEndpoint = endpoint;
  },

  // Authentication
  login: async (username, password) => {
    try {
      const response = await fetch(`${apiEndpoint}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! Status: ${response.status}, Response: ${errorText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error logging in:", error.message);
      throw error;
    }
  },

  register: async (userData) => {
    try {
      const response = await fetch(`${apiEndpoint}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! Status: ${response.status}, Response: ${errorText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error registering user:", error.message);
      throw error;
    }
  },

  driverLogin: async (username, password) => {
    try {
      const response = await fetch(`${apiEndpoint}/driver_login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! Status: ${response.status}, Response: ${errorText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error logging in driver:", error.message);
      throw error;
    }
  },

  // Data fetching
  getDeliveries: async () => {
    try {
      const response = await fetch(`${apiEndpoint}/deliveries`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching deliveries:", error.message);
      throw error;
    }
  },

  getUsers: async () => {
    try {
      const response = await fetch(`${apiEndpoint}/users`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching users:", error.message);
      throw error;
    }
  },

  getDrivers: async (company = null) => {
    try {
      let url = `${apiEndpoint}/drivers`;
      if (company) {
        url += `?company=${encodeURIComponent(company)}`;
      }
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching drivers:", error.message);
      throw error;
    }
  },

  getTrucks: async (company = null) => {
    try {
      let url = `${apiEndpoint}/trucks`;
      if (company) {
        url += `?company=${encodeURIComponent(company)}`;
      }
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching trucks:", error.message);
      throw error;
    }
  },

  getNonUserRequests: async () => {
    try {
      const response = await fetch(`${apiEndpoint}/non_user_requests`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching non-user requests:", error.message);
      throw error;
    }
  },

  getUserDeliveries: async () => {
    try {
      const response = await fetch(`${apiEndpoint}/get-deliveries`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching user deliveries:', error);
      throw error;
    }
  },

  getDriver: async (uid) => {
    try {
      const response = await fetch(`${apiEndpoint}/driver/${uid}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching driver:", error.message);
      throw error;
    }
  },

  // Data saving/updating
  saveNonUserRequest: async (reqData) => {
    try {
      const response = await fetch(`${apiEndpoint}/saveNonUserRequests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reqData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! Status: ${response.status}, Response: ${errorText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error saving request data:", error.message);
      throw error;
    }
  },

  makeDelivery: async (reqData) => {
    try {
      const response = await fetch(`${apiEndpoint}/make-delivery`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reqData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! Status: ${response.status}, Response: ${errorText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error saving delivery data:", error.message);
      throw error;
    }
  },

  saveDriverData: async (driverData) => {
    try {
      const response = await fetch(`${apiEndpoint}/saveDriverData`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(driverData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! Status: ${response.status}, Response: ${errorText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error saving driver data:", error.message);
      throw error;
    }
  },

  saveTruckData: async (truckData) => {
    try {
      const response = await fetch(`${apiEndpoint}/saveTruckData`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(truckData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! Status: ${response.status}, Response: ${errorText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error saving truck data:", error.message);
      throw error;
    }
  },

  updateDeliveryStatus: async (uid, status) => {
    try {
      const response = await fetch(`${apiEndpoint}/non_user_requests/${uid}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! Status: ${response.status}, Response: ${errorText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error updating delivery status:", error.message);
      throw error;
    }
  },

  updateDriverTruck: async (uid, plate) => {
    try {
      const response = await fetch(`${apiEndpoint}/drivers/${uid}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plate }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! Status: ${response.status}, Response: ${errorText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error updating driver truck:", error.message);
      throw error;
    }
  },

  // Driver-Truck assignments
  assignDriverToTruck: async (driverId, truckId) => {
    try {
      const response = await fetch(`${apiEndpoint}/assignments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ driverId, truckId }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! Status: ${response.status}, Response: ${errorText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error assigning driver to truck:', error.message);
      throw error;
    }
  }
};

// Export for use in other modules
export default api;