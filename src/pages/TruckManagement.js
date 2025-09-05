// src/components/TruckManagement.js

import React, { useState, useEffect } from "react";
import { useDatabase } from "../contexts/DatabaseContext";
import { useAuth } from "../contexts/AuthContext";
import "./TruckManagement.css";
import { v4 as uuidv4 } from "uuid";
import Maps from "../components/Maps2";
import { Select } from "antd";
import { storage, ref, uploadBytes, getDownloadURL } from "../contexts/firebaseContext"; // Adjust the import path accordingly

import NoDataSvg from "../media/no_data.svg";

function TruckManagement() {
  const {
    saveTruckDataToAPI,
    fetchTrucksFromAPI,
    fetchDriversFromAPI,
    saveAssignmentToAPI,
    fetchAssignmentsFromAPI,
    trucks,
    drivers,
    assignments,
    loading,
  } = useDatabase();
  const { user } = useAuth();


  // console.log("ai class: ", useAI)
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTruck, setEditTruck] = useState(null);
  const [truckType, setTruckType] = useState("");
  const [truckImage, setTruckImage] = useState(null);
  const [numberPlate, setNumberPlate] = useState("");
  const [yearOfManufacture, setYearOfManufacture] = useState("");
  const [make, setMake] = useState("");
  const [load, setLoad] = useState("");
  const [mileage, setMileage] = useState("");
  const [fuelType, setFuelType] = useState("");
  const [selectedDriver, setSelectedDriver] = useState("");
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedTruck, setSelectedTruck] = useState(null);
  const [truckSpeed, setTruckSpeed] = useState()
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [isAddingTruck, setIsAddingTruck] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const trucksPerPage = 12;

  useEffect(() => {
    fetchTrucksFromAPI();
    fetchDriversFromAPI();
    fetchAssignmentsFromAPI();
  }, []);

  
  const handleImageUpload = async (file) => {

    const sanitizedFileName = file.name.replace(/\s+/g, '_');
  
    // Creating a reference with the sanitized file name
    const storageRef = ref(storage, `navis_truck_images/${sanitizedFileName}`);

    // Upload the file
    await uploadBytes(storageRef, file);
  
    // Get the download URL
    const imageUrl = await getDownloadURL(storageRef);
  
    return imageUrl;
  };

  const handleAddTruck = async (e) => {
    e.preventDefault();
    if (!truckType || !truckImage || !numberPlate || !yearOfManufacture || !make || !mileage || !fuelType || !load) {
      alert("Please provide all truck details");
      return;
    }

    setIsAddingTruck(true);
    try {
      const imageUrl = await handleImageUpload(truckImage);
      const truckData = {
        uid: uuidv4(),
        type: truckType,
        imageUrl: imageUrl,
        numberPlate: numberPlate,
        yearOfManufacture: yearOfManufacture,
        make: make,
        mileage: mileage,
        fuelType: fuelType,
        load: load,
        company: user.company,
        speed: truckSpeed
      };
      await saveTruckDataToAPI(truckData);
      fetchTrucksFromAPI();
      setTruckType("");
      setTruckImage(null);
      setNumberPlate("");
      setYearOfManufacture("");
      setMake("");
      setMileage("");
      setFuelType("");
      setLoad("");
      setTruckSpeed("")
    } catch (error) {
      console.error("Error adding truck:", error.message);
      alert("Error adding truck");
    } finally {
      setIsAddingTruck(false);
    }
  };

  const openMapModal = () => {
    setIsMapModalOpen(true);
  };
  
  const closeMapModal = () => {
    setIsMapModalOpen(false);
  };
  

  const openEditModal = (truck) => {
    setEditTruck(truck);
    setTruckType(truck.type || "");
    setTruckImage(null); // No need to set the image here unless it's changed
    setNumberPlate(truck.numberPlate || "");
    setYearOfManufacture(truck.yearOfManufacture || "");
    setMake(truck.make || "");
    setMileage(truck.mileage || "");
    setFuelType(truck.fuelType || "");
    setLoad(truck.load || "");
    setTruckSpeed(truck.speed || "");
    setIsEditModalOpen(true);
  };
  

  const handleEditTruck = async (e) => {
    e.preventDefault();
    if (!editTruck) {
      alert("No truck selected for editing");
      return;
    }
  
    try {
      // Upload a new image if one is provided
      const imageUrl = truckImage ? await handleImageUpload(truckImage) : editTruck.imageUrl;
  
      // Prepare the updated truck data
      const updatedTruckData = {
        ...editTruck,
        type: truckType || editTruck.type,
        imageUrl: imageUrl,
        numberPlate: numberPlate || editTruck.numberPlate,
        yearOfManufacture: yearOfManufacture || editTruck.yearOfManufacture,
        make: make || editTruck.make,
        mileage: mileage || editTruck.mileage,
        fuelType: fuelType || editTruck.fuelType,
        load: load || editTruck.load,
        speed: truckSpeed || editTruck.speed,
        
      };
  
      await saveTruckDataToAPI(updatedTruckData);
      fetchTrucksFromAPI(); // Refresh truck list
      setTruckType("");
      setTruckImage(null);
      setNumberPlate("");
      setYearOfManufacture("");
      setMake("");
      setMileage("");
      setFuelType("");
      setLoad("");
      setTruckSpeed("");
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Error updating truck:", error.message);
      alert("Error updating truck");
    }
  };
  
  

  const handleTruckImageChange = (e) => {
    setTruckImage(e.target.files[0]);
  };


console.log("selected truck: ", selectedDriver)

  const handleAssignTruck = async () => {
    if (!selectedTruck || !selectedDriver) {
      alert("Please select a truck and a driver");
      return;
    }

    setIsAssigning(true);
    try {
      await saveAssignmentToAPI({
        driverId: selectedDriver,
        truckId: selectedTruck.uid,
      });
      fetchAssignmentsFromAPI(); // Re-fetch assignments
      alert("Truck assigned successfully!");
    } catch (error) {
      console.error("Error assigning truck:", error.message);
      alert("Error assigning truck");
    } finally {
      setIsAssigning(false);
    }
  };

  const openTruckDetailsModal = (truck) => {
    setSelectedTruck(truck);
    setIsDetailModalOpen(true);
  };

  const getAssignedDriver = (truckId) => {
    const assignment = assignments?.find(a => a.truckId === truckId);
    if (!assignment) return "None";
    const driver = drivers.find(d => d.uid === assignment.driverId);
    return driver ? driver.name : "Unknown Driver";
  };

  const filteredTrucks = trucks.filter((truck) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      truck.type.toLowerCase().includes(searchLower) ||
      truck.numberPlate.toLowerCase().includes(searchLower) ||
      truck.make.toLowerCase().includes(searchLower)
    );
  });

  const indexOfLastTruck = currentPage * trucksPerPage;
  const indexOfFirstTruck = indexOfLastTruck - trucksPerPage;
  const currentTrucks = filteredTrucks.slice(indexOfFirstTruck, indexOfLastTruck);
  const totalPages = Math.ceil(filteredTrucks.length / trucksPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);


  return (
    <div className="truck-management">
      <div className="truck_header">
      <h1>Truck Management</h1>
      <button className="add-truck-btn2" onClick={openMapModal}>Add New Truck</button>

      </div>
      {loading && <div className="progress-bar" />}
      <div className="truck-div">

        <div className="maps_section">

        {isMapModalOpen && (
          <div className="modal2 addtrucks">
            <div className="mm-holderw">
              <div className="modal-content29">
                <h2>Add New Truck</h2>
                <form onSubmit={handleAddTruck}>
                <Select className="select-truck" value={truckType} onChange={(value) => setTruckType(value)}>
  <option value="" disabled>Select Truck Type</option>
  <option value="Flatbed truck">Flatbed Truck</option>
  <option value="Box truck(dry van)">Box Truck(Dry van)</option>
  <option value="Refrigerated Truck(Reefers)">Refrigerated Truck(Reefers)</option>
  <option value="Tankers">Tankers</option>
  <option value="Dump Truck">Dump Truck</option>
  <option value="Car Carrier">Car Carrier</option>
  <option value="Livestock Truck">Livestock Truck</option>
  <option value="Container Truck">Container Truck</option>
  <option value="LTL Trucks">LTL Truck</option>
  <option value="Heavy Haulers">Heavy Hauler</option>
</Select>

                  <div className="">
                    <div className="form-inner">
                      <input type="text" placeholder="Number Plate" value={numberPlate} onChange={(e) => setNumberPlate(e.target.value)} />
                      <input type="text" placeholder="Year of Manufacture" value={yearOfManufacture} onChange={(e) => setYearOfManufacture(e.target.value)} />
                      <input type="text" placeholder="Make" value={make} onChange={(e) => setMake(e.target.value)} />
                      <input type="text" placeholder="Mileage" value={mileage} onChange={(e) => setMileage(e.target.value)} />
                      <input type="text" placeholder="Load Capacity" value={load} onChange={(e) => setLoad(e.target.value)} />
                      <input type="text" placeholder="Fuel Type" value={fuelType} onChange={(e) => setFuelType(e.target.value)} />
                      <input type="text" placeholder="Speed" value={truckSpeed} onChange={(e) => setTruckSpeed(e.target.value)} />
                      <input type="file" onChange={handleTruckImageChange} />
                    </div>
                  </div>
                  <button className="add-truck-btn"  type="submit" disabled={isAddingTruck}>{isAddingTruck ? "Adding Truck..." : "Add Truck"}</button>
                </form>
                <button onClick={closeMapModal}>Close</button>
              </div>
            </div>
          </div>
        )}

          <div className="tm-map">
<div className="truck-actions">
        <input
            type="text"
            placeholder="Search for a truck..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />

        
             <div className="pagination">
              <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>
                Previous
              </button>
              <span>{currentPage} of {totalPages}</span>
              <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages}>
                Next
              </button>
            </div>  
</div>
            <div className="wideMe">
      



          <div className="trucks-list">
            {loading ? (
              <p>Loading...</p>
            ) : currentTrucks.length === 0 ? (
              <div className="no-data-div">
              <p className="no-data-text">Opps, No Trucks Found!</p>
              <img className="no-data-img" src={NoDataSvg} alt="No data" />

              </div>
            ) : (
                currentTrucks.map((truck) => (
                <div key={truck.uid} className="truck-item" onClick={() => openTruckDetailsModal(truck)}>
                  <img className="car-image" src={truck.imageUrl} alt={truck.type} />
                  <div className="car-details">
                    <h2>{truck.type}</h2>
                    <p>Number Plate: {truck.numberPlate}</p>
                    <p>Year of Manufacture: {truck.yearOfManufacture}</p>
                    <p>Make: {truck.make}</p>
                    <p>Mileage: {truck.mileage}</p>
                    <p>Fuel Type: {truck.fuelType}</p>
                    <p>Load: {truck.load}</p>
                    <p>Speed: {truck.speed || ""}</p>
                    <p>Company: {truck.company || ""}</p>
                  </div>
                </div>
              ))
            )}
          </div>
          {/* <div className="pagination">
              <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>
                Previous
              </button>
              <span>{currentPage} of {totalPages}</span>
              <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages}>
                Next
              </button>
            </div> */}
        </div>
        </div>
        </div>

      
        {isEditModalOpen && editTruck && (
  <div style={{zIndex:222}}  className="modal2">
    <div className="mm-holder">
      <div className="modal-content2">
        <h2>Edit Truck Details</h2>
        <form onSubmit={handleEditTruck}>
          <input
            type="text"
            className="ed_input"
            placeholder="Number Plate"
            value={numberPlate}
            onChange={(e) => setNumberPlate(e.target.value)}
          />
          <input
            type="text"
            className="ed_input"
            placeholder="Year of Manufacture"
            value={yearOfManufacture}
            onChange={(e) => setYearOfManufacture(e.target.value)}
          />
          <input
            type="text"
            className="ed_input"
            placeholder="Make"
            value={make}
            onChange={(e) => setMake(e.target.value)}
          />
          <input
            type="text"
            className="ed_input"
            placeholder="Truck Speed"
            value={truckSpeed}
            onChange={(e) => setTruckSpeed(e.target.value)}
          />
          <input
            type="text"
            className="ed_input"
            placeholder="Load Capacity"
            value={load}
            onChange={(e) => setLoad(e.target.value)}
          />
          <input
            type="text"
            className="ed_input"
            placeholder="Mileage"
            value={mileage}
            onChange={(e) => setMileage(e.target.value)}
          />
          <input
            type="text"
            className="ed_input"
            placeholder="Fuel Type"
            value={fuelType}
            onChange={(e) => setFuelType(e.target.value)}
          />
          <input type="file" onChange={handleTruckImageChange} />
          <button className="update_truck_btn" type="submit" disabled={loading}>
            {loading ? "Updating Truck..." : "Update Truck"}
          </button>
        </form>
        <button onClick={() => setIsEditModalOpen(false)}>Close</button>
      </div>
      <div className="modal-image">
        <img className="truck-modal-image" src={editTruck.imageUrl} alt={editTruck.type} />
      </div>
    </div>
  </div>
)}


        {isDetailModalOpen && selectedTruck && (
          <div className="modal2">
            <div className="mm-holder">
              <div className="modal-content2">
                <h2>Truck Details</h2>
                <p>Number Plate: {selectedTruck.numberPlate}</p>
                <p>Year of Manufacture: {selectedTruck.yearOfManufacture}</p>
                <p>Make: {selectedTruck.make}</p>
                <p>Mileage: {selectedTruck.mileage}</p>
                <p>Fuel Type: {selectedTruck.fuelType}</p>
                <p>Load: {selectedTruck.load}</p>
                <p>speed: {selectedTruck.speed}</p>

                <p>Driver: {getAssignedDriver(selectedTruck.uid)}</p> 

                <div className="spinner">
                  <label>Assign a driver from the options below.</label>
                <Select
                className="sel"
  value={selectedDriver}
  onChange={(value) => setSelectedDriver(value)} // value directly provides the selected value
  placeholder="Select Driver"
>
  {drivers.map((driver) => (
    <option key={driver.uid} value={driver.uid}>
      {driver.name}
    </option>
  ))}
</Select>
                  <button className="assign-truck-btn" onClick={handleAssignTruck} disabled={isAssigning}>
                    {isAssigning ? 'Assigning...' : 'Assign Truck'}
                  </button>
                </div>
                <button className="edit_truck" onClick={() => openEditModal(selectedTruck)}>Edit Truck</button>
                <button onClick={() => setIsDetailModalOpen(false)}>Close</button>

              </div>
              <div className="modal-image">
                <img className="truck-modal-image" src={selectedTruck.imageUrl} alt={selectedTruck.type} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TruckManagement;
