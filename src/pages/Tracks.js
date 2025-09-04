import React, { useState, useEffect } from "react";
import { useDatabase } from "../contexts/DatabaseContext";

const Tracks = () => {
  const { fetchTrucksFromAPI, trucks } = useDatabase();
  const [currentPage, setCurrentPage] = useState(1); // Current page number
  const itemsPerPage = 9; 
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal visibility
  const [selectedTruck, setSelectedTruck] = useState(null); // Selected truck for modal


  // Fetch trucks when the component mounts
  useEffect(() => {
    fetchTrucksFromAPI();
  }, []);

  // Calculate the current trucks to display
  const indexOfLastTruck = currentPage * itemsPerPage;
  const indexOfFirstTruck = indexOfLastTruck - itemsPerPage;
  const currentTrucks = trucks.slice(indexOfFirstTruck, indexOfLastTruck);

  // Handle pagination
  const totalPages = Math.ceil(trucks.length / itemsPerPage);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const openModal = (truck) => {
    setSelectedTruck(truck);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedTruck(null);
    setIsModalOpen(false);
  };


  return (
    <div style={{ padding: "20px" }}>
      <h1>Truck List</h1>

      {/* Trucks Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)", // 3 columns
          gap: "20px", // Space between grid items
        }}
      >
        {currentTrucks.map((truck) => (
          <div
            key={truck.uid}
            style={{
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "15px",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
            }}
            onClick={() => openModal(truck)} // Open modal with truck details

          >
            <img
              src={truck.imageUrl}
              alt={truck.type}
              style={{
                width: "100%",
                height: "150px",
                objectFit: "cover",
                borderRadius: "8px",
              }}
            />
            <h3>{truck.type}</h3>
            <p>Number Plate: {truck.numberPlate}</p>
            <p>Company: {truck.company}</p>
            <p>Load: {truck.load} kg</p>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      <div style={{ marginTop: "20px", display: "flex", justifyContent: "center" }}>
        <button
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          style={{
        
            cursor: currentPage === 1 ? "not-allowed" : "pointer",
          }}
        >
          Previous
        </button>
        <span style={{ padding: "10px 20px" }}>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          style={{
      
            cursor: currentPage === totalPages ? "not-allowed" : "pointer",
          }}
        >
          Next
        </button>
      </div>


      {/* Modal for Truck Details */}
      {isModalOpen && selectedTruck && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: "8px",
              padding: "20px",
              width: "400px",
              textAlign: "center",
              position: "relative",
            }}
          >
        
            <img
              src={selectedTruck.imageUrl}
              alt={selectedTruck.type}
              style={{ width: "100%", height: "200px", objectFit: "cover", borderRadius: "8px" }}
            />
            <h2 style={{textAlign:"left"}}>{selectedTruck.type}</h2>
            <div style={{display:"flex", flexDirection:"column", textAlign:"left"}}>
           <p><strong>Number Plate:</strong> {selectedTruck.numberPlate}</p>
            <p><strong>Company:</strong> {selectedTruck.company}</p>
            <p><strong>Load:</strong> {selectedTruck.load} kg</p>
            <p><strong>Year of Manufacture:</strong> {selectedTruck.yearOfManufacture}</p>
            <p><strong>Fuel Type:</strong> {selectedTruck.fuelType}</p>
            <p><strong>Mileage:</strong> {selectedTruck.mileage} km</p> 
            <button style={{marginTop:"2rem"}}
              onClick={closeModal}
            >
close            </button>    
            </div>

          
          </div>
        </div>
      )}

    </div>
  );
};

export default Tracks;
