import React, { useState, useEffect } from "react";
import { useDatabase } from "../contexts/DatabaseContext";
import { Row, Col, Card, Pagination, Modal, Button, Typography } from "antd";

const { Title, Text } = Typography;

const Tracks = () => {
  const { fetchTrucksFromAPI, trucks } = useDatabase();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTruck, setSelectedTruck] = useState(null);

  useEffect(() => {
    fetchTrucksFromAPI();
  }, []);

  const indexOfLastTruck = currentPage * itemsPerPage;
  const indexOfFirstTruck = indexOfLastTruck - itemsPerPage;
  const currentTrucks = trucks.slice(indexOfFirstTruck, indexOfLastTruck);

  const handlePageChange = (page) => {
    setCurrentPage(page);
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
      <Title level={2}>Truck List</Title>

      <Row gutter={[16, 16]}>
        {currentTrucks.map((truck) => (
          <Col xs={24} sm={12} md={8} key={truck.uid}>
            <Card
              hoverable
              cover={<img alt={truck.type} src={truck.imageUrl} style={{ height: 150, objectFit: 'cover' }} />}
              onClick={() => openModal(truck)}
            >
              <Card.Meta
                title={truck.type}
                description={
                  <>
                    <Text>Number Plate: {truck.numberPlate}</Text><br />
                    <Text>Company: {truck.company}</Text><br />
                    <Text>Load: {truck.load} kg</Text>
                  </>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>

      <div style={{ marginTop: "20px", display: "flex", justifyContent: "center" }}>
        <Pagination
          current={currentPage}
          total={trucks.length}
          pageSize={itemsPerPage}
          onChange={handlePageChange}
        />
      </div>

      {selectedTruck && (
        <Modal
          title={selectedTruck.type}
          visible={isModalOpen}
          onCancel={closeModal}
          footer={[
            <Button key="close" onClick={closeModal}>
              Close
            </Button>,
          ]}
        >
          <img
            src={selectedTruck.imageUrl}
            alt={selectedTruck.type}
            style={{ width: "100%", height: "200px", objectFit: "cover", borderRadius: "8px" }}
          />
          <Title level={4} style={{ marginTop: "1rem" }}>Details</Title>
          <Text strong>Number Plate:</Text> {selectedTruck.numberPlate}<br />
          <Text strong>Company:</Text> {selectedTruck.company}<br />
          <Text strong>Load:</Text> {selectedTruck.load} kg<br />
          <Text strong>Year of Manufacture:</Text> {selectedTruck.yearOfManufacture}<br />
          <Text strong>Fuel Type:</Text> {selectedTruck.fuelType}<br />
          <Text strong>Mileage:</Text> {selectedTruck.mileage} km
        </Modal>
      )}
    </div>
  );
};

export default Tracks;