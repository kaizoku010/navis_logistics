import { Button, Col, Row, Progress } from "antd";
import React, { useContext, useEffect, useState } from "react";
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
  const { allTrucks, fetchAllTrucksFromAPI, saveNonUserRequestToAPI } = useDatabase();
  const [data, setData] = useState();
  const [numberPlate, setNumberPlate] = useState();
  const [company, setCompany] = useState();
  const [loading, setLoading] = useState(false);
  const [requestSaved, setRequestSaved] = useState(false);
  const [fetchError, setFetchError] = useState(false);



console.log('ALL TRUCKS: ', allTrucks)
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
          return truckLoad >= minAcceptableWeight && truckLoad <= maxAcceptableWeight;
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
    const distance = 100; // Example distance in km
    return distance / truck.speed; // Calculate time in hours
  };

  useEffect(() => {
    const fetchCoordinates = async (address) => {
      const API_KEY = "AIzaSyAy4-wGmH9U6le-7lCL9rm0N2nxxBsNWi0";
      const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json`, {
        params: {
          address,
          key: API_KEY,
        },
      });
      console.log("response :", response)
      return response.data.results[0].geometry.location;
    };

    const getCoordinates = async () => {
      const pickupCoords = await fetchCoordinates(address.pickup);
      const destinationCoords = await fetchCoordinates(address.destination);
      setCoords({ pickupCoords, destinationCoords });
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

      await saveNonUserRequestToAPI(data);
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
              <p>Delivery Name: {details.name}</p>
              <p>Contact Information: {details.contact}</p>
              <p>Email Address: {details.email}</p>
              <p>State Of Items: {details.state}</p>
            </Col>
            <Col span={24}>
              <h2>More Information</h2>
              <p>Weight: {address.weight}</p>
              <p>Pickup point: {address.pickup}</p>
              <p>Destination: {address.destination}</p>
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
                  <p className="est-time">Estimated Delivery Time: {calculateDeliveryTime(truckInfo)} hours</p>
                  <h1 className="truck-info-front">Truck Information</h1>
                  <p>Fuel Type: {truckInfo.fuelType}</p>
                  <p>Make: {truckInfo.make}</p>
                  <p>Mileage: {truckInfo.mileage}</p>
                  <p>Type: {truckInfo.type}</p>
                  <p>Car Load: {truckInfo.load}</p>
                  <p>Speed: {truckInfo.speed}</p>
                  <p>Year Of Manufacture: {truckInfo.yearOfManufacture}</p>
                  <img className="front-page" src={truckInfo.imageUrl} alt="Truck" />
                </div>
              </>
            ) : (
              !loading && <p>No suitable truck found for the delivery</p>
            )}
          </div>
          <div className="mapOba">
            {coords.pickupCoords && coords.destinationCoords ? (
              <Maps coordinates={{ pickup: coords.pickupCoords, destination: coords.destinationCoords }} />
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
