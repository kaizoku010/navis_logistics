// src/components/TruckManagement.js

import React, { useState, useEffect } from "react";
import { useDatabase } from "../contexts/DatabaseContext";
import { useAuth } from "../contexts/AuthContext";
import "./TruckManagement.css";
import { v4 as uuidv4 } from "uuid";
import { Table, Button, Modal, Form, Input, Select, Upload, message, Image } from "antd";
import { UploadOutlined } from '@ant-design/icons';
import { storage, ref, uploadBytes, getDownloadURL } from "../contexts/firebaseContext"; // Adjust the import path accordingly

const { Option } = Select;

function TruckManagement() {
  const {
    saveTruckDataToAPI,
    fetchTrucksFromAPI,
    fetchDriversFromAPI,
    saveAssignmentToAPI,
    fetchAssignmentsFromAPI,
    updateDriver,
    deleteTruck,
    trucks,
    drivers,
    assignments,
    loading,
  } = useDatabase();
  const { user } = useAuth();

  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [editingTruck, setEditingTruck] = useState(null);
  const [selectedTruck, setSelectedTruck] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState("");
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    fetchTrucksFromAPI();
    fetchDriversFromAPI();
    fetchAssignmentsFromAPI();
  }, []);

  const handleImageUpload = async (file) => {
    const sanitizedFileName = file.name.replace(/\s+/g, '_');
    const storageRef = ref(storage, `navis_truck_images/${sanitizedFileName}`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  };

  const onFinish = async (values) => {
    try {
      let imageUrl = values.imageUrl;
      if (values.upload && values.upload[0]) {
        imageUrl = await handleImageUpload(values.upload[0].originFileObj);
      }

      const truckData = {
        ...values,
        imageUrl,
        uid: editingTruck ? editingTruck.uid : uuidv4(),
        company: user.company,
      };

      await saveTruckDataToAPI(truckData);
      fetchTrucksFromAPI();
      setIsEditModalVisible(false);
      form.resetFields();
      message.success(`Truck ${editingTruck ? 'updated' : 'added'} successfully!`);
    } catch (error) {
      console.error("Error saving truck:", error.message);
      message.error("Error saving truck");
    }
  };

  const showEditModal = (truck = null) => {
    setEditingTruck(truck);
    form.setFieldsValue(truck ? { ...truck, upload: [] } : { type: '', cargoType: '' });
    setIsEditModalVisible(true);
  };

  const showDetailModal = (truck) => {
    setSelectedTruck(truck);
    setIsDetailModalVisible(true);
  };

  const handleDelete = async (truckId) => {
    if (window.confirm("Are you sure you want to delete this truck?")) {
      try {
        await deleteTruck(truckId);
        fetchTrucksFromAPI();
        message.success("Truck deleted successfully!");
      } catch (error) {
        console.error("Error deleting truck:", error.message);
        message.error("Error deleting truck");
      }
    }
  };

  const handleAssignTruck = async () => {
    if (!selectedTruck || !selectedDriver) {
      alert("Please select a truck and a driver");
      return;
    }

    try {
      await saveAssignmentToAPI({
        driverId: selectedDriver,
        truckId: selectedTruck.uid,
      });
      // Update the driver's currentTruckId
      await updateDriver(selectedDriver, { currentTruckId: selectedTruck.uid });
      fetchAssignmentsFromAPI(); // Re-fetch assignments
      message.success("Truck assigned successfully!");
      setIsDetailModalVisible(false);
    } catch (error) {
      console.error("Error assigning truck:", error.message);
      message.error("Error assigning truck");
    }
  };

  const getAssignedDriver = (truckId) => {
    const assignment = assignments?.find(a => a.truckId === truckId);
    if (!assignment) return "None";
    const driver = drivers.find(d => d.uid === assignment.driverId);
    return driver ? driver.name : "Unknown Driver";
  };

  const filteredTrucks = trucks.filter((truck) => {
    const searchLower = searchText.toLowerCase();
    const belongsToCompany = user?.company ? truck.company === user.company : true;
    return belongsToCompany && (
      (truck.type && truck.type.toLowerCase().includes(searchLower)) ||
      (truck.numberPlate && truck.numberPlate.toLowerCase().includes(searchLower)) ||
      (truck.make && truck.make.toLowerCase().includes(searchLower))
    );
  });

  const columns = [
    { title: 'Image', dataIndex: 'imageUrl', key: 'imageUrl', render: (text) => <Image src={text} width={50} /> },
    { title: 'Type', dataIndex: 'type', key: 'type', filters: [...new Set(trucks.map(t => t.type))].map(t => ({ text: t, value: t })), onFilter: (value, record) => record.type.includes(value) },
    { title: 'Number Plate', dataIndex: 'numberPlate', key: 'numberPlate' },
    { title: 'Make', dataIndex: 'make', key: 'make' },
    { title: 'Assigned Driver', key: 'assignedDriver', render: (text, record) => getAssignedDriver(record.uid) },
    {
      title: 'Action',
      key: 'action',
      render: (text, record) => (
        <span>
          <Button type="link" onClick={() => showEditModal(record)}>Edit</Button>
          <Button type="link" danger onClick={() => handleDelete(record.uid)}>Delete</Button>
        </span>
      ),
    },
  ];

  return (
    <div className="truck-management">
      <div className="truck_header">
        <h1>Truck Management</h1>
        <Button type="primary" onClick={() => showEditModal()}>Add New Truck</Button>
      </div>
      <Input.Search
        placeholder="Search for a truck..."
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        style={{ marginBottom: 16 }}
      />
      <Table
        columns={columns}
        dataSource={filteredTrucks}
        loading={loading}
        rowKey="uid"
        onRow={(record) => ({
          onClick: () => {
            showDetailModal(record);
          },
        })}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingTruck ? "Edit Truck" : "Add New Truck"}
        visible={isEditModalVisible}
        onCancel={() => {
          setIsEditModalVisible(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="type" label="Truck Type" rules={[{ required: true }]}>
            <Select placeholder="Select Truck Type">
              <Option value="Flatbed truck">Flatbed Truck</Option>
              <Option value="Box truck(dry van)">Box Truck(Dry van)</Option>
              <Option value="Refrigerated Truck(Reefers)">Refrigerated Truck(Reefers)</Option>
              <Option value="Tankers">Tankers</Option>
              <Option value="Dump Truck">Dump Truck</Option>
              <Option value="Car Carrier">Car Carrier</Option>
              <Option value="Livestock Truck">Livestock Truck</Option>
              <Option value="Container Truck">Container Truck</Option>
              <Option value="LTL Trucks">LTL Truck</Option>
              <Option value="Heavy Haulers">Heavy Hauler</Option>
            </Select>
          </Form.Item>
          <Form.Item name="cargoType" label="Cargo Type" rules={[{ required: true }]}>
            <Select placeholder="Select Cargo Type">
              <Option value="solid">Solid</Option>
              <Option value="liquid">Liquid</Option>
              <Option value="both">Both</Option>
            </Select>
          </Form.Item>
          <Form.Item name="numberPlate" label="Number Plate" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="yearOfManufacture" label="Year of Manufacture">
            <Input />
          </Form.Item>
          <Form.Item name="make" label="Make">
            <Input />
          </Form.Item>
          <Form.Item name="mileage" label="Mileage">
            <Input />
          </Form.Item>
          <Form.Item name="load" label="Load Capacity">
            <Input />
          </Form.Item>
          <Form.Item name="fuelType" label="Fuel Type">
            <Input />
          </Form.Item>
          <Form.Item name="speed" label="Speed">
            <Input />
          </Form.Item>
          <Form.Item name="upload" label="Truck Image" valuePropName="fileList" getValueFromEvent={(e) => e.fileList}>
            <Upload name="logo" listType="picture" beforeUpload={() => false}>
              <Button icon={<UploadOutlined />}>Click to upload</Button>
            </Upload>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              {editingTruck ? "Update Truck" : "Add Truck"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {selectedTruck && (
        <Modal
          title="Truck Details"
          visible={isDetailModalVisible}
          onCancel={() => setIsDetailModalVisible(false)}
          footer={[
            <Button key="back" onClick={() => setIsDetailModalVisible(false)}>
              Close
            </Button>,
          ]}
        >
          <Image src={selectedTruck.imageUrl} width={200} />
          <p><strong>Type:</strong> {selectedTruck.type}</p>
          <p><strong>Number Plate:</strong> {selectedTruck.numberPlate}</p>
          <p><strong>Make:</strong> {selectedTruck.make}</p>
          <p><strong>Year of Manufacture:</strong> {selectedTruck.yearOfManufacture}</p>
          <p><strong>Mileage:</strong> {selectedTruck.mileage}</p>
          <p><strong>Fuel Type:</strong> {selectedTruck.fuelType}</p>
          <p><strong>Load:</strong> {selectedTruck.load}</p>
          <p><strong>Speed:</strong> {selectedTruck.speed}</p>
          <p><strong>Cargo Type:</strong> {selectedTruck.cargoType}</p>
          <p><strong>Assigned Driver:</strong> {getAssignedDriver(selectedTruck.uid)}</p>

          <Form layout="vertical">
            <Form.Item label="Assign Driver">
              <Select
                placeholder="Select a driver"
                onChange={(value) => setSelectedDriver(value)}
                style={{ width: '100%' }}
              >
                {drivers.map(driver => (
                  <Option key={driver.uid} value={driver.uid}>{driver.name}</Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item>
              <Button type="primary" onClick={handleAssignTruck} loading={loading}>
                Assign Truck
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      )}
    </div>
  );
}

export default TruckManagement;
