clear// Comprehensive API Test Suite
import api from './server';

// Mock environment for testing
process.env.REACT_APP_MONGO_URI = 'mongodb://localhost:27017/navis_test';

// Test data
const testUserData = {
  username: 'testuser',
  email: 'test@example.com',
  company: 'Test Company',
  password: 'testpassword',
  accountType: 'cargo-mover',
  imageUrl: 'http://example.com/image.jpg'
};

const testDriverData = {
  name: 'Test Driver',
  email: 'driver@example.com',
  company: 'Test Company',
  password: 'driverpassword',
  licenseNumber: 'DL123456',
  phone: '123-456-7890'
};

const testTruckData = {
  make: 'Volvo',
  model: 'VNL',
  year: 2022,
  plateNumber: 'TRK123',
  company: 'Test Company',
  capacity: '20 tons'
};

const testDeliveryData = {
  origin: 'New York',
  destination: 'Los Angeles',
  weight: '5000 kg',
  description: 'Electronics shipment',
  company: 'Test Company'
};

// Test function
async function runAPITests() {
  console.log('🧪 Starting API Tests...\n');
  
  try {
    // Test 1: User Registration
    console.log('1. Testing User Registration...');
    try {
      const registerResult = await api.register(testUserData);
      console.log('   ✅ Registration successful:', registerResult.message);
    } catch (error) {
      console.log('   ❌ Registration failed:', error.message);
    }
    
    // Test 2: User Login
    console.log('\n2. Testing User Login...');
    try {
      const loginResult = await api.login(testUserData.username, testUserData.password);
      console.log('   ✅ Login successful:', loginResult.username);
    } catch (error) {
      console.log('   ❌ Login failed:', error.message);
    }
    
    // Test 3: Driver Login
    console.log('\n3. Testing Driver Login...');
    try {
      const driverLoginResult = await api.driverLogin(testDriverData.name, testDriverData.password);
      console.log('   ✅ Driver login successful:', driverLoginResult.name);
    } catch (error) {
      console.log('   ❌ Driver login failed (expected if driver not registered):', error.message);
    }
    
    // Test 4: Save Driver Data
    console.log('\n4. Testing Save Driver Data...');
    try {
      const saveDriverResult = await api.saveDriverData(testDriverData);
      console.log('   ✅ Driver data saved:', saveDriverResult.message);
    } catch (error) {
      console.log('   ❌ Save driver data failed:', error.message);
    }
    
    // Test 5: Save Truck Data
    console.log('\n5. Testing Save Truck Data...');
    try {
      const saveTruckResult = await api.saveTruckData(testTruckData);
      console.log('   ✅ Truck data saved:', saveTruckResult.message);
    } catch (error) {
      console.log('   ❌ Save truck data failed:', error.message);
    }
    
    // Test 6: Save Non-User Request
    console.log('\n6. Testing Save Non-User Request...');
    try {
      const saveRequestResult = await api.saveNonUserRequest(testDeliveryData);
      console.log('   ✅ Request saved:', saveRequestResult.message);
    } catch (error) {
      console.log('   ❌ Save request failed:', error.message);
    }
    
    // Test 7: Make Delivery
    console.log('\n7. Testing Make Delivery...');
    try {
      const makeDeliveryResult = await api.makeDelivery(testDeliveryData);
      console.log('   ✅ Delivery created:', makeDeliveryResult.message);
    } catch (error) {
      console.log('   ❌ Make delivery failed:', error.message);
    }
    
    // Test 8: Get Users
    console.log('\n8. Testing Get Users...');
    try {
      const users = await api.getUsers();
      console.log('   ✅ Retrieved users:', users.length);
    } catch (error) {
      console.log('   ❌ Get users failed:', error.message);
    }
    
    // Test 9: Get Drivers
    console.log('\n9. Testing Get Drivers...');
    try {
      const drivers = await api.getDrivers();
      console.log('   ✅ Retrieved drivers:', drivers.length);
    } catch (error) {
      console.log('   ❌ Get drivers failed:', error.message);
    }
    
    // Test 10: Get Trucks
    console.log('\n10. Testing Get Trucks...');
    try {
      const trucks = await api.getTrucks();
      console.log('    ✅ Retrieved trucks:', trucks.length);
    } catch (error) {
      console.log('    ❌ Get trucks failed:', error.message);
    }
    
    // Test 11: Get Deliveries
    console.log('\n11. Testing Get Deliveries...');
    try {
      const deliveries = await api.getDeliveries();
      console.log('    ✅ Retrieved deliveries:', deliveries.length);
    } catch (error) {
      console.log('    ❌ Get deliveries failed:', error.message);
    }
    
    // Test 12: Get Non-User Requests
    console.log('\n12. Testing Get Non-User Requests...');
    try {
      const requests = await api.getNonUserRequests();
      console.log('    ✅ Retrieved requests:', requests.length);
    } catch (error) {
      console.log('    ❌ Get requests failed:', error.message);
    }
    
    console.log('\n✅ API Tests Completed!');
    console.log('\n📝 Note: Some tests may fail if MongoDB is not running or properly configured.');
    console.log('   To run these tests successfully, ensure:');
    console.log('   1. MongoDB is running locally or connection string is correct');
    console.log('   2. Database "navis_test" exists or can be created');
    console.log('   3. Network connectivity to MongoDB server');
    
  } catch (error) {
    console.error('❌ Test suite failed with error:', error);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAPITests();
}

export default runAPITests;