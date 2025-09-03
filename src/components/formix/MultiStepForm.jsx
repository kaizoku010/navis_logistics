import React, { useState } from "react";
import { Steps } from "antd";
import { Provider } from "./MultiStepFormContext";
import Details from "./Details";
import Address from "./Tellus";
import Review from "./Review";

const { Step } = Steps;

const detailsInitialState = {
  name: "",
  contact: "",
  state: "",
  email: ""
};

const addressInitialState = {
  weight: "",
  pickup: "",
  destination: ""
};

const renderStep = (step) => {
  switch (step) {
    case 0:
        // return <Address />;

      return <Details />;
    case 1:
      return <Address />;
    case 2:
      return <Review />;
    default:
      return null;
  }
};

const MultiStepForm = () => {
  const [details, setDetails] = useState(detailsInitialState);
  const [address, setAddress] = useState(addressInitialState);
  const [currentStep, setCurrentStep] = useState(0);

  const next = () => {
    if (currentStep === 2) {
      setCurrentStep(0);
      setDetails(detailsInitialState);
      setAddress(addressInitialState);
      return;
    }
    setCurrentStep(currentStep + 1);
  };
  const prev = () => setCurrentStep(currentStep - 1);
  return (
    <Provider value={{ details, setDetails, next, prev, address, setAddress }}>
      <Steps current={currentStep}>
        <Step title={"Step 1"} />
        <Step title={"Step 2"} />
        <Step title={"Step 3"} />
      </Steps>
      <main>{renderStep(currentStep)}</main>
    </Provider>
  );
};
export default MultiStepForm;
