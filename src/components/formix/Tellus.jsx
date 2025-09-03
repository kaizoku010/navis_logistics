import React, { useContext, useState } from "react";
import { Formik } from "formik";
import { Button } from "antd";
import { Input } from "formik-antd";
import MultiStepFormContext from "./MultiStepFormContext";
import PlacesAutocomplete from 'react-places-autocomplete';
import "./mulitstep.css";

const Details = () => {
  const [markers, setMarkers] = useState({ pickup: null, destination: null });
  const { address, setAddress, next, prev } = useContext(MultiStepFormContext);
  const API_KEY = 'AIzaSyAy4-wGmH9U6le-7lCL9rm0N2nxxBsNWi0';

  const getCoordinates = async (address) => {
    try {
      const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${API_KEY}`);
      const data = await response.json();
      if (data.results.length > 0) {
        const { lat, lng } = data.results[0].geometry.location;
        return { lat, lng };
      }
    } catch (error) {
      console.error('Error fetching coordinates', error);
    }
    return null;
  };

  return (
    <Formik
      initialValues={address}
      onSubmit={(values) => {
        setAddress(values);
        next();
      }}
      validate={(values) => {
        const errors = {};
        if (!values.weight) errors.weight = "Required";
        if (!values.pickup) errors.pickup = "Required";
        if (!values.destination) errors.destination = "Required";
        return errors;
      }}
    >
      {({ handleSubmit, errors, setFieldValue, values }) => (
        <div className="details__wrapper">
          <h1 className="tell-us-text">Add more information about this delivery.</h1>
          <div className={`form__item ${errors.weight && "input__error"}`}>
            <label className="label lb2">Weight (kgs, tons, lbs, liters) *</label>
            <Input className="tll-input" name="weight" />
            <p className="error__feedback">{errors.weight}</p>
          </div>
          <div className="form__item">
            <label className="label">Pickup Point</label>
            <PlacesAutocomplete
              value={values.pickup}
              onChange={(value) => setFieldValue('pickup', value)}
              onSelect={async (address) => {
                const coordinates = await getCoordinates(address);
                setFieldValue('pickup', address);
                if (coordinates) {
                  setMarkers((prev) => ({ ...prev, pickup: coordinates }));
                }
              }}
            >
              {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
                <div>
                  <input
                    {...getInputProps({
                      placeholder: 'Enter Pickup Point',
                      className: 'tll-input'
                    })}
                  />
                  <div className="autocomplete-dropdown-container">
                    {loading && <div>Loading...</div>}
                    {suggestions.map((suggestion) => {
                      const className = suggestion.active
                        ? 'suggestion-item--active'
                        : 'suggestion-item';
                      const style = suggestion.active
                        ? { backgroundColor: '#fafafa', cursor: 'pointer' }
                        : { backgroundColor: '#ffffff', cursor: 'pointer' };
                      return (
                        <div
                          {...getSuggestionItemProps(suggestion, {
                            className,
                            style
                          })}
                        >
                          <span>{suggestion.description}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </PlacesAutocomplete>
          </div>
          <div className={`form__item ${errors.destination && "input__error"}`}>
            <label className="label">Destination</label>
            <PlacesAutocomplete
              value={values.destination}
              onChange={(value) => setFieldValue('destination', value)}
              onSelect={async (address) => {
                const coordinates = await getCoordinates(address);
                setFieldValue('destination', address);
                if (coordinates) {
                  setMarkers((prev) => ({ ...prev, destination: coordinates }));
                }
              }}
            >
              {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
                <div>
                  <input
                    {...getInputProps({
                      placeholder: 'Enter Destination',
                      className: 'tll-input'
                    })}
                  />
                  <div className="autocomplete-dropdown-container">
                    {loading && <div>Loading...</div>}
                    {suggestions.map((suggestion) => {
                      const className = suggestion.active
                        ? 'suggestion-item--active'
                        : 'suggestion-item';
                      const style = suggestion.active
                        ? { backgroundColor: '#fafafa', cursor: 'pointer' }
                        : { backgroundColor: '#ffffff', cursor: 'pointer' };
                      return (
                        <div
                          {...getSuggestionItemProps(suggestion, {
                            className,
                            style
                          })}
                        >
                          <span>{suggestion.description}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </PlacesAutocomplete>
            <p className="error__feedback">{errors.destination}</p>
          </div>
          <div className="form__item button__items d-flex justify-content-between">
            <button className="back-btn-ml" type="default" onClick={prev}>
              Back
            </button>
            <button type="primary" onClick={handleSubmit}>
              Next
            </button>
          </div>
        </div>
      )}
    </Formik>
  );
};

export default Details;
