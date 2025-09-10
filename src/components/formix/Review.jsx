import { Button, Col, Row, Progress } from "antd";
import React, { useContext, useEffect, useState, useMemo } from "react";
import axios from "axios";
import MultiStepFormContext from "./MultiStepFormContext";
import "./mulitstep.css";
import { useDatabase } from "../../contexts/DatabaseContext";
import Maps from "../../pages/Maps";
import { format } from 'date-fns';

const Review = () => {
  const { details, address, prev } = useContext(MultiStepFormContext);
  const [truckInfo, setTruckInfo] = useState(null);
  const [coords, setCoords] = useState({ pickupCoords: null, destinationCoords: null });
  const [distance, setDistance] = useState(null);
  const { allTrucks, fetchAllTrucksFromAPI, saveNonUserRequestToAPI, saveDeliveryToAPI } = useDatabase();
  const [data, setData] = useState();
  const [numberPlate, setNumberPlate] = useState();
  const [company, setCompany] = useState();
  const [loading, setLoading] = useState(false);
  const [requestSaved, setRequestSaved] = useState(false);
  const [fetchError, setFetchError] = useState(false);

  const memoizedMapCoordinates = useMemo(() => ({
    pickup: coords.pickupCoords,
    destination: coords.destinationCoords
  }), [coords.pickupCoords, coords.destinationCoords]);



// console.log('ALL TRUCKS: ', allTrucks)
// console.log('Review - allTrucks:', allTrucks);
// console.log('Review - truckInfo:', truckInfo);
const formattedDate = format(new Date(), 'yyyy-MM-dd HH:mm:ss');  

useEffect(() => {
    fetchAllTrucksFromAPI().catch(() => setFetchError(true));
  }, [fetchAllTrucksFromAPI]);

  useEffect(() => {
    const getTruckInfo = async () => {
      setLoading(true);
      setFetchError(false);
      try {
        const trucks_ = allTrucks;
        const weight = Number(address.weight);
        const acceptableRange = weight * 0.2; // 20% of weight
        const minAcceptableWeight = weight - acceptableRange;
        const maxAcceptableWeight = weight + acceptableRange;

        const suitableTruck = trucks_.find(truck => {
          const truckLoad = Number(truck.load);
          const itemState = details.state.toLowerCase(); // 'solid' or 'liquid'
          const truckCargoType = truck.cargoType ? truck.cargoType.toLowerCase() : '';

          const weightMatches = truckLoad >= minAcceptableWeight && truckLoad <= maxAcceptableWeight;
          const cargoTypeMatches = truckCargoType === itemState || truckCargoType === 'both';

          return weightMatches && cargoTypeMatches;
        });

        if (suitableTruck) {
          setTruckInfo(suitableTruck);
          setNumberPlate(suitableTruck.numberPlate);
          setCompany(suitableTruck.company);
        } else {
          const largerRangeTruck = trucks_.find(truck => {
            const truckLoad = Number(truck.load);
            return truckLoad >= minAcceptableWeight * 0.5 && truckLoad <= maxAcceptableWeight * 1.5;
          });

          if (largerRangeTruck) {
            setTruckInfo(largerRangeTruck);
            setNumberPlate(largerRangeTruck.numberPlate);
            setCompany(largerRangeTruck.company);
          } else {
            setTruckInfo(null);
          }
        }
      } catch {
        setFetchError(true);
      } finally {
        setLoading(false);
      }
    };

    if (address && address.weight) {
      getTruckInfo();
    }
  }, [address, allTrucks]);

  const calculateDeliveryTime = (truck) => {
    if (!distance || !truck.speed) return "N/A";
    return distance / truck.speed; // Calculate time in hours
  };

  useEffect(() => {
    const fetchCoordinates = async (address) => {
      // console.log('Fetching coordinates for address:', address); // Log address being fetched
      if (!address) return null; // Added validation for empty address
      const API_KEY = process.env.REACT_APP_MAPS_API_KEY;
      try {
        const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json`, {
          params: {
            address,
            key: API_KEY,
          },
        });
        // console.log("response :", response);
        if (response.data.results?.length > 0) { // Added check for results array
          return response.data.results[0].geometry.location;
        }
        return null; // Return null if no results
      } catch (err) {
        console.error('Error fetching coordinates:', err); // Added error handling
        return null; // Return null on error
      }
    };

    const getCoordinates = async () => {
      // console.log('Getting coordinates for pickup:', address.pickup, 'and destination:', address.destination); // Log addresses
      const pickupCoords = await fetchCoordinates(address.pickup);
      const destinationCoords = await fetchCoordinates(address.destination);
      setCoords({ pickupCoords, destinationCoords });
      // console.log('Coordinates set:', { pickupCoords, destinationCoords }); // Log final coordinates

      // Fetch distance using Distance Matrix API
      if (pickupCoords && destinationCoords) {
        const API_KEY = process.env.REACT_APP_MAPS_API_KEY;
        try {
          const response = await axios.get(`https://maps.googleapis.com/maps/api/distancematrix/json`, {
            params: {
              origins: `${pickupCoords.lat},${pickupCoords.lng}`,
              destinations: `${destinationCoords.lat},${destinationCoords.lng}`,
              key: API_KEY,
            },
          });
          // console.log("Distance Matrix API response:", response);
          if (response.data.rows?.length > 0 && response.data.rows[0].elements?.length > 0) {
            const element = response.data.rows[0].elements[0];
            if (element.status === 'OK') {
              setDistance(element.distance.value / 1000); // Distance in kilometers
            } else {
              console.error('Distance Matrix API element status:', element.status);
              setDistance(null);
            }
          } else {
            setDistance(null);
          }
        } catch (err) {
          console.error('Error fetching distance:', err);
          setDistance(null);
        }
      }
    };

    if (address.pickup && address.destination) {
      getCoordinates();
    }
  }, [address]);

  const fwd_request = async () => {
    try {
      const data = {
        company: company,
        contact: details.contact,
        destination: address.destination,
        destinationCoords: {
          lng: { N: String(coords.destinationCoords.lng) },
          lat: { N: String(coords.destinationCoords.lat) },
        },
        name: details.name,
        pickupCoords: {
          lng: { N: String(coords.pickupCoords.lng) },
          lat: { N: String(coords.pickupCoords.lat) },
        },
        pickupPoint: address.pickup,
        state: details.state,
        weight: String(address.weight),
        plateNumber:numberPlate,
        status:"pending",
        date:formattedDate
      };

      await saveDeliveryToAPI(data);
      setRequestSaved(true);
    } catch {
      // Handle error
    }
  };

  useEffect(() => {
    const userReqest = () => {
      const dest = coords.destinationCoords;
      const pickup = coords.pickupCoords;
      const data = {
        details: details,
        weight: address.weight,
        dest: dest,
        pickup: pickup,
        truckPlate: numberPlate,
        truckOwner: company,
      };
      setData(data);
    };
    if (truckInfo) {
      userReqest();
    }
  }, [coords, numberPlate, company, address.weight, details, truckInfo]);

  const retryFetch = () => {
    setFetchError(false);
    fetchAllTrucksFromAPI().catch(() => setFetchError(true));
  };

  if (requestSaved) {
    return (
        <div className="success-message">
        <h1 className="rest">Request Successfully Forwarded</h1>
        <p className="congs">Please hold on as we verifiy and prepare your truck, we shall reach out using your contact information or call (+256-750)-323-993 to talk sales.</p>
        <button type="primary" onClick={() => window.location.href = "/"}>
          Back Home
        </button>
      </div>
    );
  }

  return (
    <div id="lastone" className={"details__wrapper"}>
      {loading ? (
        <Progress percent={50} status="active" />
      ) : fetchError ? (
        <div className="error-message">
          <p>Failed to load trucks. Please try again.</p>
          <Button type="primary" onClick={retryFetch}>Try Again</Button>
        </div>
      ) : (
        <>
          <Row className="data-last">
            <Col span={24}>
              <h1>Overview</h1>
                <p className="text-dets">Title: <span className="text-dets-span">{details.name}</span></p>
                <p className="text-dets">Contact Information: <span className="text-dets-span">{details.contact}</span></p>
                <p className="text-dets">Email Address: <span style={{marginLeft:"0px"}} className="text-dets-span">{details.email}</span></p>
                <p className="text-dets">State Of Items: <span className="text-dets-span">{details.state}</span></p>
            </Col>
            <Col span={24}>
              <h2>More Information</h2>
                <p className="text-dets">Weight: {address.weight}</p>
                <p className="text-dets">Pickup point: {address.pickup}</p>
                <p className="text-dets">Destination: {address.destination}</p>
                {loading && !truckInfo && (
                  <Progress percent={50} status="active" />
                )}
              <div className={"form__item button__items d-flex justify-content-between"}>
                <button className="rv-btn" type={"default"} onClick={prev}>
                  Back
                </button>
                <button className="rv-btn" type={"primary"} onClick={fwd_request} disabled={!truckInfo}>
                  Forward Request
                </button>
              </div>
            </Col>
          </Row>
          <div className="right_section">
            {truckInfo ? (
              <>
                <div className="front-dets">
                  {/* <p className="est-time">Estimated Delivery Time: {calculateDeliveryTime(truckInfo)} hours</p> */}
                  <h1 className="truck-info-front">Navis found you a truck</h1>
                  <p className="text-dets">Fuel Type: <span className="text-dets-span">{truckInfo.fuelType}</span></p>
                  <p className="text-dets">Make:<span className="text-dets-span">{truckInfo.make}</span></p>
                  <p className="text-dets">Mileage:<span className="text-dets-span">{truckInfo.mileage}</span></p>
                  <p className="text-dets">Type:<span className="text-dets-span">{truckInfo.type}</span></p>
                  <p className="text-dets">Car Load:<span className="text-dets-span">{truckInfo.load}</span></p>
                  <p className="text-dets">Speed:<span className="text-dets-span">{truckInfo.speed} </span></p>
                  <p className="text-dets">Year Of Manufacture: <span className="text-dets-span">{truckInfo.yearOfManufacture}</span></p>
                  <img className="front-page" src={truckInfo.imageUrl} alt="navis trucks" />
                </div>
              </>
            ) : (
              !loading && <p>No suitable truck found for the delivery</p>
            )}
          </div>
          <div className="mapOba">
            {coords.pickupCoords && coords.destinationCoords ? (
              <Maps coordinates={memoizedMapCoordinates} />
            ) : (
              !loading && <p>Loading map...</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Review;
