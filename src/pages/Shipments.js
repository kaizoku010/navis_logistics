import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  button,
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
import {
  useJsApiLoader,
  GoogleMap,
  Marker,
  DirectionsService,
  DirectionsRenderer,
} from '@react-google-maps/api';
import PlacesAutocomplete from 'react-places-autocomplete';
import { useDatabase } from '../contexts/DatabaseContext';
import { useAuth } from '../contexts/AuthContext';
import './shipments.css';

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

const containerStyle = { width: '100%', height: '100%' };
const API_KEY = process.env.REACT_APP_MAPS_API_KEY;
const libraries = ['places'];

const Shipments = () => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: API_KEY,
    libraries,
  });

  const { user } = useAuth();
  const { deliveries, fetchDeliveriesFromAPI, saveDeliveryToAPI, fetchTrucksFromAPI } = useDatabase();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    state: '',
    weight: '',
    weightUnit: 'Kgs',
    destination: '',
    pickupPoint: '',
    contact: '',
  });

//a simple test to see if we can map user shipments only
   const testArray = deliveries
    .filter(delivery => 
      delivery.company?.toLowerCase() === user.company.toLowerCase())

      console.log("test deliveries: ", testArray)

  const [directions, setDirections] = useState(null);
  const [markers, setMarkers] = useState({ pickup: null, destination: null });
  const mapRef = useRef(null);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePickupChange = useCallback((value) => {
    setForm((prev) => ({ ...prev, pickupPoint: value }));
  }, []);

  const handleDestinationChange = useCallback((value) => {
    setForm((prev) => ({ ...prev, destination: value }));
  }, []);

  const getCoordinates = async (address) => {
    if (!address) return null;
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          address
        )}&key=${API_KEY}`
      );
      const data = await res.json();
      if (data.results?.length > 0) {
        const { lat, lng } = data.results[0].geometry.location;
        return { lat, lng };
      }
      return null;
    } catch (err) {
      console.error('Error fetching coordinates', err);
      return null;
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const pickupCoords = await getCoordinates(form.pickupPoint);
      const destinationCoords = await getCoordinates(form.destination);

      if (!pickupCoords || !destinationCoords) {
        alert('Invalid pickup or destination address');
        return;
      }

      const newItem = {
        uid: uuidv4(),
        ...form,
        status: 'pending',
        pickupCoords,
        destinationCoords,
        company: user.company,
        date: new Date().toISOString(),
      };

      const result = await saveDeliveryToAPI(newItem);

      if (result?.error) throw new Error(result.error);

      await fetchDeliveriesFromAPI();
      handleClose();
      setForm({
        name: '',
        state: '',
        weight: '',
        weightUnit: 'Kgs',
        destination: '',
        pickupPoint: '',
        contact: '',
      });
    } catch (err) {
      console.error('Save failed:', err.message);
      alert(err.message || 'Failed to save delivery');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveriesFromAPI();
    fetchTrucksFromAPI();
  }, []);

  const handleLoadDirections = (delivery) => {
    if (!delivery.pickupCoords || !delivery.destinationCoords) return;
    setDirections({
      origin: delivery.pickupCoords,
      destination: delivery.destinationCoords,
      travelMode: 'DRIVING',
    });
    setMarkers({
      pickup: delivery.pickupCoords,
      destination: delivery.destinationCoords,
    });
  };

  const directionsCallback = useCallback((response) => {
    if (response && response.status === 'OK') {
      setDirections((prev) => ({ ...prev, directions: response }));
    }
  }, []);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', padding: 2 }}>
      <Modal open={open} onClose={handleClose}>
        <Box sx={modalStyle}>
          <Typography variant="h6" component="h2">
            Add Delivery Item
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField fullWidth label="Name" name="name" value={form.name} onChange={handleFormChange} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="State" name="state" value={form.state} onChange={handleFormChange} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="Weight" name="weight" value={form.weight} onChange={handleFormChange} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="Contact" name="contact" value={form.contact} onChange={handleFormChange} />
            </Grid>
            <Grid item xs={12}>
              <PlacesAutocomplete
                value={form.pickupPoint}
                onChange={handlePickupChange}
                onSelect={handlePickupChange}
              >
                {({ getInputProps, suggestions, getSuggestionItemProps }) => (
                  <div style={{ position: 'relative' }}>
                    <TextField {...getInputProps({ placeholder: 'Pickup Point' })} fullWidth />
                    <div style={{ position: 'absolute', zIndex: 10, background: '#fff' }}>
                      {suggestions.map((s) => (
                        <div
                          {...getSuggestionItemProps(s)}
                          key={s.placeId}
                          style={{ padding: '8px', cursor: 'pointer', borderBottom: '1px solid #ddd' }}
                        >
                          {s.description}
                        </div>
                      ))}
                    </div>
                  </div>
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
                  <div style={{ position: 'relative' }}>
                    <TextField {...getInputProps({ placeholder: 'Destination' })} fullWidth />
                    <div style={{ position: 'absolute', zIndex: 10, background: '#fff' }}>
                      {suggestions.map((s) => (
                        <div
                          {...getSuggestionItemProps(s)}
                          key={s.placeId}
                          style={{ padding: '8px', cursor: 'pointer', borderBottom: '1px solid #ddd' }}
                        >
                          {s.description}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </PlacesAutocomplete>
            </Grid>
          </Grid>
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={handleSubmit} variant="contained" disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Save'}
            </button>
          </Box>
        </Box>
      </Modal>

      <div className="map_list_area">
        <div className="list_sect">
          <Typography variant="h5">Shipments</Typography>
          <p className="sec">
            This section lets you add shipments which will be observed by our AI and then pick
            the most viable transportation available in our system.
          </p>
          <button variant="contained" onClick={handleOpen}>
            Add Shipment
          </button>
          <List className="data">
            {testArray.map((delivery) => (
              <ListItem
              divider={true}
                key={delivery.uid}
                onClick={() => handleLoadDirections(delivery)}
                sx={{ cursor: 'pointer' }}
              >
                <ListItemText
                  primary={`Type: ${delivery.name}`}
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
              {directions && directions.origin && directions.destination && (
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
                <DirectionsRenderer options={{ directions: directions.directions }} />
              )}
            </GoogleMap>
          ) : (
            <div>Loading Map...</div>
          )}
        </div>
      </div>
    </Box>
  );
};

export default Shipments;
