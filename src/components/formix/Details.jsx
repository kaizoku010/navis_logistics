import React, { useContext } from "react";
import { Formik } from "formik";

import { Input, InputNumber, Select } from "formik-antd";
import MultiStepFormContext from "./MultiStepFormContext";
import "./mulitstep.css"
import {useNavigate} from "react-router-dom"


const Details = () => {
  const { details, setDetails, next } = useContext(MultiStepFormContext);
  const navigation = useNavigate()


  const home = ()=>{
    navigation("/")
  }

  return (
    <Formik
      initialValues={details}
      onSubmit={(values) => {
        setDetails(values);
        next();
      }}
      validate={(values) => {
        const errors = {};
        if (!values.name) errors.name = "Required";
        if (!values.contact) errors.contact = "Required";
        if(!values.email) errors.email ="Required"
        return errors;
      }}
    >
      {({ handleSubmit, errors }) => {
        return (
          <div className={"details__wrapper"}>
            <h1 className="tell-us-text">Please tell us more about your delivery</h1>
            <div className={`form__item ${errors.name && "input__error"}`}>
              <label>Delivery name</label>
              <Input name={"name"} className="tll-input"/>
              <p className={"error__feedback"}>{errors.name}</p>
            </div>
            <div className={`form__item ${errors.contact && "input__error"}`}>
            <label>Contact information *</label>
                <InputNumber className="tll-input number" name={"contact"}/>
              <p className={"error__feedback"}>{errors.contact}</p>
            </div>
            <div
              className={`form__item ${errors.profession && "input__error"}`}
            >
              <label>Email Address*</label>
              <Input className="tll-input" name={"email"} />
              <p className={"error__feedback"}>{errors.email}</p>
            </div>
            <div
              className={`form__item ${errors.profession && "input__error"}`}
            >
              <label>State (state can either be liquid or solid) *</label>
              <Select className="tll-input" name={"state"}>
                <Select.Option value="solid">Solid</Select.Option>
                <Select.Option value="liquid">Liquid</Select.Option>
              </Select>
              <p className={"error__feedback"}>{errors.profession}</p>
            </div>
            <div
              className={"form__item button__items d-flex justify-content-end"}
            >
              <div>
                <button className="ml-btn" type={"primary"} onClick={handleSubmit}>
                Next
              </button>

              <button className="ml-btn2" type={"primary"} onClick={home}>
                Back Home
              </button> 
              </div>
             
            </div>
          </div>
        );
      }}
    </Formik>
  );
};
export default Details;
