import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Button,
  Modal,
  TextField,
  Typography,
  Grid,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
} from '@mui/material';
import { v4 as uuidv4 } from 'uuid';
import { useJsApiLoader, GoogleMap, Marker, DirectionsService, DirectionsRenderer } from '@react-google-maps/api';
import PlacesAutocomplete from 'react-places-autocomplete'; 
import { useDatabase } from '../contexts/DatabaseContext';
import { useAuth } from '../contexts/AuthContext';

import "./shipments.css";

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

const containerStyle = {
  width: '100%',
  height: '100%',
};

const API_KEY = process.env.REACT_APP_MAPS_API_KEY

const libraries = ["places"];

const Shipments = () => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: API_KEY,
    libraries,
  });

  const { 
    user,
   } = useAuth(); // Access user and API client
  const {
    deliveries,
    loading,
    fetchDeliveriesFromAPI,
    saveDeliveryToAPI,
    fetchTrucksFromAPI,
    trucks,
  } = useDatabase();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    state: '',
    weight: '',
    weightUnit: 'Kgs',
    destination: '',
    pickupPoint: '',
    contact: '',
  });
  const [directions, setDirections] = useState(null);
  const [markers, setMarkers] = useState({ pickup: null, destination: null });
  const mapRef = useRef(null);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({ ...prevForm, [name]: value }));
  };


  const handlePickupChange = useCallback((value) => {
    setForm((prevForm) => ({ ...prevForm, pickupPoint: value }));
  }, []);

  const handleDestinationChange = useCallback((value) => {
    setForm((prevForm) => ({ ...prevForm, destination: value }));
  }, []);

  const getCoordinates = async (address) => {
    try {
      const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${API_KEY}`);
      const data = await response.json();

      console.log("response from maps: ", response)
      if (data.results.length > 0) {
        const { lat, lng } = data.results[0].geometry.location;
        return { lat, lng };
      }
    } catch (error) {
      console.error('Error fetching coordinates', error);
    }
    return null;
  };

  const handleSubmit = async () => {
    const pickupCoords = await getCoordinates(form.pickupPoint);
    const destinationCoords = await getCoordinates(form.destination);

    if (!pickupCoords || !destinationCoords) {
      console.error('Error fetching coordinates');
      return;
    }

    const newItem = {
      uid: uuidv4(),
      ...form,
      status: 'pending',
      pickupCoords,
      destinationCoords,
      company: user.company,
      date: new Date().toISOString(), // Automatically set the current date
    };

    try {
      await saveDeliveryToAPI(newItem); 
      fetchDeliveriesFromAPI();
      handleClose();
    } catch (error) {
      console.error('Error saving delivery', error);
    }
  };

  // useEffect(() => {
  //   fetchDeliveriesFromAPI();
  //   fetchTrucksFromAPI();
  // }, []);

 useEffect(() => {
    fetchDeliveriesFromAPI();
    fetchTrucksFromAPI();
  }, [])

  useEffect(() => {
    // fetchDeliveries();
    fetchTrucksFromAPI();

  }, [trucks]);

  // console.log("trucks found: ", trucks)

  const handleLoadDirections = (delivery) => {
    const { pickupCoords, destinationCoords } = delivery;
    setDirections({
      origin: pickupCoords,
      destination: destinationCoords,
      travelMode: 'DRIVING',
    });
    setMarkers({
      pickup: pickupCoords,
      destination: destinationCoords,
    });
  };

  const directionsCallback = useCallback((response) => {
    if (response && response.status === 'OK') {
      setDirections((prev) => ({ ...prev, directions: response }));
    }
  }, []);

  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', padding: 2, flexDirection: "column" }}>
      <Box sx={{ width: '60%' }}>
        <Modal open={open} onClose={handleClose}>
          <Box sx={modalStyle}>
            <Typography variant="h6" component="h2">
              Add Delivery Item
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Name"
                  name="name"
                  value={form.name}
                  onChange={handleFormChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="State"
                  name="state"
                  value={form.state}
                  onChange={handleFormChange}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Weight"
                  name="weight"
                  value={form.weight}
                  onChange={handleFormChange}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Contact"
                  name="contact"
                  value={form.contact}
                  onChange={handleFormChange}
                />
              </Grid>
              <Grid item xs={12}>
                <PlacesAutocomplete
                  value={form.pickupPoint}
                  onChange={handlePickupChange}
                  onSelect={handlePickupChange}
                >
                  {({ getInputProps, suggestions, getSuggestionItemProps }) => (
                    <>
                      <TextField
                        {...getInputProps({ placeholder: 'Pickup Point' })}
                        fullWidth
                      />
                      <div style={{ position: 'absolute', zIndex: 1 }}>
                        {suggestions.map((suggestion) => (
                          <div
                            {...getSuggestionItemProps(suggestion)}
                            key={suggestion.placeId}
                            style={{
                              padding: '8px',
                              cursor: 'pointer',
                              backgroundColor: '#fff',
                              borderBottom: '1px solid #ddd',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f0f0f0')}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#fff')}
                          >
                            {suggestion.description}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </PlacesAutocomplete>
              </Grid>
              <Grid item xs={12}>
                <PlacesAutocomplete
                  value={form.destination}
                  onChange={handleDestinationChange}
                  onSelect={handleDestinationChange}
                >
                  {({ getInputProps, suggestions, getSuggestionItemProps }) => (
                    <>
                      <TextField
                        {...getInputProps({ placeholder: 'Destination' })}
                        fullWidth
                      />
                      <div style={{ position: 'absolute', zIndex: 1, backgroundColor: 'white' }}>
                        {suggestions.map((suggestion) => (
                          <div
                            {...getSuggestionItemProps(suggestion)}
                            key={suggestion.placeId}
                            style={{
                              padding: '8px',
                              cursor: 'pointer',
                              backgroundColor: '#fff',
                              borderBottom: '1px solid #ddd',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f0f0f0')}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#fff')}
                          >
                            {suggestion.description}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </PlacesAutocomplete>
              </Grid>
            </Grid>
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button onClick={handleSubmit} variant="contained" disabled={loading}>
                {loading ? <CircularProgress size={24} /> : 'Save'}
              </Button>
            </Box>
          </Box>
        </Modal>
      </Box>

      <div className='map_list_area'>
        <div className='list_sect'>
          <Typography variant="h5">Shipments</Typography>
          <p className='sec'>This section lets you add shipments which will be observed by our AI and then pick the most viable transportation available in our system.</p>
          <button sx={{ marginTop: 12 }} variant="contained" onClick={handleOpen}>
            Add Shipment
          </button>
          <List className='data'>
            {deliveries.map((delivery) => (
              <ListItem
                key={delivery.uid}
                onClick={() => handleLoadDirections(delivery)}
                sx={{ cursor: 'pointer' }}
              >
                <ListItemText
                  primary={`Name: ${delivery.name}`}
                  secondary={`Weight: ${delivery.weight}kg - ${delivery.pickupPoint} to ${delivery.destination}`}
                />
              </ListItem>
            ))}
          </List>
        </div>
        <div className="map_sect">
          {isLoaded ? (
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={markers.pickup || { lat: 0.3476, lng: 32.5825 }}
              zoom={13}
              onLoad={(map) => (mapRef.current = map)}
            >
              {markers.pickup && <Marker position={markers.pickup} />}
              {markers.destination && <Marker position={markers.destination} />}
              {directions && (
                <DirectionsService
                  options={{
                    origin: directions.origin,
                    destination: directions.destination,
                    travelMode: 'DRIVING',
                  }}
                  callback={directionsCallback}
                />
              )}
              {directions && directions.directions && (
                <DirectionsRenderer
                  options={{ directions: directions.directions }}
                />
              )}
            </GoogleMap>
          ) : (
            <div>Loading...</div>
          )}
        </div>
      </div>
    </Box>
  );
};

export default Shipments;
