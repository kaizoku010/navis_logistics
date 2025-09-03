import React, { useState, useEffect, useMemo } from 'react';
import { useAWS } from '../contexts/MongoContext';
import { useTable } from 'react-table';
import './drivers.css';
import Search from '../components/Search';
import { v4 as uuidv4 } from 'uuid';
import Button from '@mui/joy/Button';
import LinearProgress from '@mui/material/LinearProgress';
import { storage, ref, uploadBytes, getDownloadURL } from "../contexts/firebaseContext"; // Adjust the import path accordingly

function Drivers() {
  const { fetchDriversFromAPI, user, saveDriverDataToAPI, uploadDriverImageToS3, loading, drivers, trucks, assignments } = useAWS();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [driverName, setDriverName] = useState('');
  const [driverImage, setDriverImage] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [age, setAge] = useState('');
  const [permitId, setPermitId] = useState('');
  const [ninNumber, setNinNumber] = useState('');
  const [progress, setProgress] = useState(0);

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
  
    // Create a reference with the sanitized file name
    const storageRef = ref(storage, `navis_driver_images/${sanitizedFileName}`);

    // Upload the file
    await uploadBytes(storageRef, file);
  
    // Get the download URL
    const imageUrl = await getDownloadURL(storageRef);
  
    return imageUrl;
  };

  const handleAddDriver = async (e) => {
    e.preventDefault();
    if (!driverName || !driverImage || !phoneNumber || !age || !permitId || !ninNumber) {
      alert('Please provide all driver details');
      return;
    }

    try {
      const onUploadProgress = (event) => {
        const percentCompleted = Math.round((event.loaded * 100) / event.total);
        setProgress(percentCompleted);
      };

      const imageUrl = await handleImageUpload(driverImage, onUploadProgress);
      const driverData = {
        uid: uuidv4(),
        name: driverName,
        imageUrl: imageUrl,
        company: user.company,
        phoneNumber: phoneNumber,
        age: age,
        permitId: permitId,
        ninNumber: ninNumber,
        password:uuidv4().slice(0,)
      };
      await saveDriverDataToAPI(driverData);
      fetchDriversFromAPI();
      setDriverName('');
      setDriverImage(null);
      setPhoneNumber('');
      setAge('');
      setPermitId('');
      setNinNumber('');
      setIsModalOpen(false);
      setProgress(0); // Reset progress bar after successful upload
    } catch (error) {
      console.error('Error adding driver:', error.message);
      alert('Error adding driver');
    }
  };

  const handleDriverClick = (driver) => {
    setSelectedDriver(driver);
    setIsDetailModalOpen(true);
  };


 const assignmentMap = useMemo(() => {
    const map = new Map();
    assignments.forEach(a => {
      const truck = trucks.find(t => t.uid === a.truckId);
      if (truck) {
        map.set(a.driverId, `${truck.type} (${truck.numberPlate})`);
      }
    });
    return map;
  }, [assignments, trucks]);
  
  const getAssignedTruck = (driverId) => {
    return assignmentMap.get(driverId) || 'None';
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
      accessor: 'numberPlate',
    },
    {
      Header: 'Password',
      accessor: 'password',
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
        <button style={{width:"20%", borderRadius:"10px"}} className='' onClick={() => setIsModalOpen(true)}>Add Driver</button>
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
              <input
                type="text"
                className='wideInput'
                placeholder="Driver Name"
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
              />
              <input
                type="file"
                onChange={handleDriverImageChange}
              />
              <input
                type="text"
                className='wideInput'
                placeholder="Phone Number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
              <input
                type="number"
                placeholder="Age"
                className='wideInput'
                value={age}
                onChange={(e) => setAge(e.target.value)}
              />
              <input
                type="text"
                placeholder="Permit ID"
                className='wideInput'
                value={permitId}
                onChange={(e) => setPermitId(e.target.value)}
              />
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
              <button className='close-btn btn-mdx' onClick={() => setIsDetailModalOpen(false)}>Close</button>
              <button className='assign-btn btn-mdx' onClick={() => setIsDetailModalOpen(false)}>Assign Driver</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Drivers;
