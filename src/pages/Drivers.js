import React, { useState, useEffect, useMemo } from 'react';
import { useDatabase } from '../contexts/DatabaseContext';
import { useAuth } from '../contexts/AuthContext';
import { useTable } from 'react-table';
import './drivers.css';
import Search from '../components/Search';


import Button from '@mui/joy/Button';
import LinearProgress from '@mui/material/LinearProgress';
import { storage, ref, uploadBytes, getDownloadURL, firestore } from "../contexts/firebaseContext";
import { doc, setDoc } from "firebase/firestore";

function Drivers() {
  const { fetchDriversFromAPI, saveDriverDataToAPI, deleteDriver, updateDriver, loading, drivers, trucks, assignments } = useDatabase();
  const [driverEmail, setDriverEmail] = useState('');
  const [driverPassword, setDriverPassword] = useState('');
  const { user } = useAuth();
  const [isAddingDriver, setIsAddingDriver] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [driverName, setDriverName] = useState('');
  const [driverImage, setDriverImage] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [age, setAge] = useState('');
  const [permitId, setPermitId] = useState('');
  const [ninNumber, setNinNumber] = useState('');
  const [progress, setProgress] = useState(0);

  const [selectedTruckId, setSelectedTruckId] = useState(''); // New state for selected truck

  useEffect(() => {
    fetchDriversFromAPI();
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleDriverImageChange = (e) => {
    setDriverImage(e.target.files[0]);
  };

  const handleImageUpload = async (file) => {
    const sanitizedFileName = file.name.replace(/\s+/g, '_');
    const storageRef = ref(storage, `navis_driver_images/${sanitizedFileName}`);
    await uploadBytes(storageRef, file);
    const imageUrl = await getDownloadURL(storageRef);
    return imageUrl;
  };

  const handleAddDriver = async (e) => {
    e.preventDefault();
    if (!driverName || !driverEmail || !driverPassword || !phoneNumber || !age || !permitId || !ninNumber) {
      alert('Please provide all driver details, including email and password.');
      return;
    }

    setIsAddingDriver(true);

    try {
      const onUploadProgress = (event) => {
        const percentCompleted = Math.round((event.loaded * 100) / event.total);
        setProgress(percentCompleted);
      };

      const imageUrl = driverImage ? await handleImageUpload(driverImage, onUploadProgress) : "";

      const driverData = {
        name: driverName,
        email: driverEmail,
        password: driverPassword, // Storing password directly
        imageUrl: imageUrl,
        company: user.company,
        phoneNumber: phoneNumber,
        age: age,
        permitId: permitId,
        ninNumber: ninNumber,
        currentLatitude: null,
        currentLongitude: null,
        status: 'available',
        currentTruckId: null,
        currentDeliveryId: null,
      };

      const result = await saveDriverDataToAPI(driverData);

      // Optional: You might still want a 'users' collection for role management
      // but without firebase auth uid. Using the generated uid instead.
      await setDoc(doc(firestore, "users", result.id), {
        username: driverName,
        email: driverEmail,
        company: user.company,
        accountType: 'driver',
        imageUrl: imageUrl,
      });

      alert('Driver added successfully!');
      fetchDriversFromAPI();
      setDriverName('');
      setDriverEmail('');
      setDriverPassword('');
      setDriverImage(null);
      setPhoneNumber('');
      setAge('');
      setPermitId('');
      setNinNumber('');
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error adding driver:', error);
      alert(`Error adding driver: ${error.message}`);
    } finally {
      setIsAddingDriver(false);
      setProgress(0);
    }
  };

  const handleDriverClick = (driver) => {
    setSelectedDriver(driver);
    setIsDetailModalOpen(true);
  };

  const handleDeleteConfirmation = (driverId) => {
    setSelectedDriver(driverId);
    setIsConfirmModalOpen(true);
  };

  const handleDeleteDriver = async () => {
    try {
      await deleteDriver(selectedDriver);
      fetchDriversFromAPI();
      setIsConfirmModalOpen(false);
    } catch (error) {
      console.error('Error deleting driver:', error);
      alert('Failed to delete driver.');
    }
  };

  const handleUpdateDriver = async (e) => {
    e.preventDefault();
    if (!selectedDriver) return;

    const updatedDriverData = {
        ...selectedDriver,
        name: driverName || selectedDriver.name,
        email: driverEmail || selectedDriver.email,
        phoneNumber: phoneNumber || selectedDriver.phoneNumber,
        age: age || selectedDriver.age,
        permitId: permitId || selectedDriver.permitId,
        ninNumber: ninNumber || selectedDriver.ninNumber,
        password: driverPassword || selectedDriver.password,
    };

    try {
        await updateDriver(selectedDriver.id, updatedDriverData);
        fetchDriversFromAPI();
        setIsEditModalOpen(false);
        // Clear fields
        setDriverName('');
        setDriverEmail('');
        setDriverPassword('');
        setPhoneNumber('');
        setAge('');
        setPermitId('');
        setNinNumber('');
    } catch (error) {
        console.error('Error updating driver:', error);
        alert('Failed to update driver.');
    }
  };


 const assignmentMap = useMemo(() => {
    const map = new Map();
    assignments.forEach(a => {
      const truck = trucks.find(t => t.id === a.truckId);
      if (truck) {
        map.set(a.driverId, `${truck.type} (${truck.numberPlate})`);
      }
    });
    return map;
  }, [assignments, trucks]);
  
  const getAssignedTruck = (driverId) => {
    return assignmentMap.get(driverId) || 'None';
  };
  


  const handleAssignTruck = async () => {
    if (!selectedDriver || !selectedTruckId) {
      alert('Please select a driver and a truck to assign.');
      return;
    }

    try {
      await updateDriver(selectedDriver.id, { currentTruckId: selectedTruckId });
      alert('Truck assigned successfully!');
      fetchDriversFromAPI(); // Refresh the list
      setIsDetailModalOpen(false); // Close the modal
      setSelectedTruckId(''); // Clear selected truck
    } catch (error) {
      console.error('Error assigning truck:', error);
      alert('Failed to assign truck.');
    }
  };

  const filteredDrivers = drivers.filter(driver =>
    driver.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = useMemo(() => [
    {
      Header: 'Driver Name',
      accessor: 'name'
    },
    {
      Header: 'Company',
      accessor: 'company'
    },
    {
      Header: 'Phone Number',
      accessor: 'phoneNumber'
    },
    {
      Header: 'Age',
      accessor: 'age'
    },
    {
      Header: 'Permit ID',
      accessor: 'permitId'
    },
    {
      Header: 'NIN Number',
      accessor: 'ninNumber'
    },
    {
      Header: 'Assigned Truck',
      accessor: 'id',
      Cell: ({ cell }) => (
        <span>{getAssignedTruck(cell.row.original.id)}</span>
      )
    },
    {
      Header: 'Password',
      accessor: 'password',
    },
    {
        Header: 'Actions',
        accessor: 'actions',
        Cell: ({ cell }) => (
            <div>
                <button onClick={(e) => {
                    e.stopPropagation();
                    setSelectedDriver(cell.row.original);
                    setIsEditModalOpen(true);
                }}>Edit</button>
                <button onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteConfirmation(cell.row.original.id)
                }}>Delete</button>
            </div>
        )
    }
  ], []);

  const data = useMemo(() => filteredDrivers, [filteredDrivers]);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable({ columns, data });

  return (
    <div className='all-drivers-page'>
      <div className='add-driver'>
        <Search />
        <Button style={{width:"20%", borderRadius:"10px"}} className='' onClick={() => setIsModalOpen(true)}>Add Driver</Button>
      </div>
      <div className='all-drivers'>
        <table {...getTableProps()} className='drivers-table'>
          <thead>
            {headerGroups.map(headerGroup => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map(column => (
                  <th {...column.getHeaderProps()}>{column.render('Header')}</th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {rows.map(row => {
              prepareRow(row);
              return (
                <tr {...row.getRowProps()} onClick={() => handleDriverClick(row.original)}>
                  {row.cells.map(cell => (
                    <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div style={{width:"fit-content"}} className='modal'>
          <div className='modal-content2'>
            <h2>Add Driver</h2>
            {loading && <LinearProgress size="md"  variant="soft" value={progress} />}
            <form onSubmit={handleAddDriver}>
              <label>Driver Name</label>
              <input
                type="text"
                className='wideInput'
                placeholder="Driver Name"
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
              />
              <label>Driver Email</label>
              <input
                type="email"
                className='wideInput'
                placeholder="Driver Email"
                value={driverEmail}
                onChange={(e) => setDriverEmail(e.target.value)}
              />
              <label>Driver Password</label>
              <input
                type="password"
                className='wideInput'
                placeholder="Driver Password"
                value={driverPassword}
                onChange={(e) => setDriverPassword(e.target.value)}
              />
              <label>Driver Image</label>
              <input
                type="file"
                onChange={handleDriverImageChange}
              />
              <label>Phone Number</label>
              <input
                type="text"
                className='wideInput'
                placeholder="Phone Number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
              <label>Age</label>
              <input
                type="number"
                placeholder="Age"
                className='wideInput'
                value={age}
                onChange={(e) => setAge(e.target.value)}
              />
              <label>Permit ID</label>
              <input
                type="text"
                placeholder="Permit ID"
                className='wideInput'
                value={permitId}
                onChange={(e) => setPermitId(e.target.value)}
              />
              <label>NIN Number</label>
              <input
                type="text"
                placeholder="NIN Number"
                className='wideInput'
                value={ninNumber}
                onChange={(e) => setNinNumber(e.target.value)}
              />
              <button className='btn-mdx' type="submit" disabled={loading}>
                {loading ? 'Adding Driver...' : 'Add Driver'}
              </button>
              <button className='btn-mdx' type="button" onClick={() => setIsModalOpen(false)}>Cancel</button>
            </form>
          </div>
        </div>
      )}

      {isDetailModalOpen && selectedDriver && (
        <div className='modal2'>
          <div className='modal-content'>
            <div className='driver-img-section'>
              <img className='driver_image2' src={selectedDriver.imageUrl} alt={selectedDriver.name} />
            </div>
            <div className='details-popup'>
              <h2 className='add-dr'>Driver Details</h2>
              <h2 className='driver-name'>Name: {selectedDriver.name}</h2>
              <p>Company: {selectedDriver.company}</p>
              <p>Phone Number: {selectedDriver.phoneNumber}</p>
              <p>Age: {selectedDriver.age}</p>
              <p>Permit ID: {selectedDriver.permitId}</p>
              <p>NIN Number: {selectedDriver.ninNumber}</p>
              <p>Assigned Truck: {selectedDriver.numberPlate}</p>
              
              <div className="assign-truck-section">
                <label htmlFor="truck-select">Assign Truck:</label>
                <select
                  id="truck-select"
                  value={selectedTruckId}
                  onChange={(e) => setSelectedTruckId(e.target.value)}
                >
                  <option value="">-- Select a Truck --</option>
                  {trucks.map(truck => (
                    <option key={truck.id} value={truck.id}>
                      {truck.numberPlate} ({truck.type})
                    </option>
                  ))}
                </select>
              </div>

              <button className='close-btn btn-mdx' onClick={() => setIsDetailModalOpen(false)}>Close</button>
              <button className='assign-btn btn-mdx' onClick={handleAssignTruck}>Assign Driver</button>
            </div>
          </div>
        </div>
      )}

      {isConfirmModalOpen && (
        <div className='modal'>
          <div className='modal-content2'>
            <h2>Confirm Deletion</h2>
            <p>Are you sure you want to delete this driver?</p>
            <button onClick={handleDeleteDriver}>Yes, Delete</button>
            <button onClick={() => setIsConfirmModalOpen(false)}>Cancel</button>
          </div>
        </div>
      )}

      {isEditModalOpen && selectedDriver && (
        <div style={{width:"fit-content"}} className='modal'>
          <div className='modal-content2'>
            <h2>Edit Driver</h2>
            <form onSubmit={handleUpdateDriver}>
              <label>Driver Name</label>
              <input
                type="text"
                className='wideInput'
                placeholder="Driver Name"
                defaultValue={selectedDriver.name}
                onChange={(e) => setDriverName(e.target.value)}
              />
              <label>Driver Email</label>
              <input
                type="email"
                className='wideInput'
                placeholder="Driver Email"
                defaultValue={selectedDriver.email}
                onChange={(e) => setDriverEmail(e.target.value)}
              />
              <label>Driver Password</label>
              <input
                type="password"
                className='wideInput'
                placeholder="Driver Password"
                onChange={(e) => setDriverPassword(e.target.value)}
              />
              <label>Phone Number</label>
              <input
                type="text"
                className='wideInput'
                placeholder="Phone Number"
                defaultValue={selectedDriver.phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
              <label>Age</label>
              <input
                type="number"
                placeholder="Age"
                className='wideInput'
                defaultValue={selectedDriver.age}
                onChange={(e) => setAge(e.target.value)}
              />
              <label>Permit ID</label>
              <input
                type="text"
                placeholder="Permit ID"
                className='wideInput'
                defaultValue={selectedDriver.permitId}
                onChange={(e) => setPermitId(e.target.value)}
              />
              <label>NIN Number</label>
              <input
                type="text"
                placeholder="NIN Number"
                className='wideInput'
                defaultValue={selectedDriver.ninNumber}
                onChange={(e) => setNinNumber(e.target.value)}
              />
              <button className='btn-mdx' type="submit">Update Driver</button>
              <button className='btn-mdx' type="button" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Drivers;
