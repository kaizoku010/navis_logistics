import React from "react";
import "./cubes.css";
import Map1 from "../assets/routes.png";

function Cubes({ image, title, desc }) {
  return (
    <div className="cube-holder-item">
      <div className="cubeItem">
        <img className="cube-image" src={image} />
        <div className="cube-txt-section">
   <h4 className="cube_title">{ title}</h4>
        <p className="cube-desc">
       {desc}
        </p>
        </div>
     
      </div>
    </div>
  );
}

export default Cubes;
