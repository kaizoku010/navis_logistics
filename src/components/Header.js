import React from 'react';
import "./header.css";
import {
  useScroll,
  useAnimatedValue,
  AnimatedBlock,
  interpolate
} from "react-ui-animate";
import {Link, useNavigate } from "react-router-dom"

import Logo from "../assets/logo2.png";

function Header() {
  const y = useAnimatedValue(0, { immediate: true });
  const navigate = useNavigate()
  useScroll(({ scrollY }) => {
    y.value = scrollY;
  });


  const boxShadow = interpolate(
    y.value,
    [0, 400],
    ["0px 0px 0px rgba(0,0,0,0.2)", "0px 4px 20px rgba(0,0,0,0.2)"],
    {
      extrapolate: "clamp"
    }
  );

  const imageSize = interpolate(y.value, [0, 25], [100, 50], {
    extrapolate: "clamp"
  });

  return (
    <div className='header_div'>
      <AnimatedBlock
        className="blockHeader"
        style={{
          backgroundColor: "#ffffff",
          display: "flex",
          alignItems: "center",
          paddingTop: 10,
          paddingBottom: 10,
          paddingLeft: "12rem",
          paddingRight: "12rem",
          position: "fixed",
          width: "100%",
          boxShadow
        }}
      >
        <AnimatedBlock className="logo_holder">
          <img className='logo' src={Logo} />
          <div className='button_holder'>
            <button className='header_btn'>Home</button>
            <button className='header_btn'>Features</button>
            <button className='header_btn'>Pricing</button>
            <Link to="/sales">
            <button className='header_btn'>Contact</button>
            </Link>
          </div>
        </AnimatedBlock>
        <div
          style={{
            fontWeight: "bold",
            fontSize: 20,
            marginLeft: 20,
            flex: 1,
            color: "#353535"
          }}
        >
          {/* Header Title */}
        </div>
        <div className='contact-header'>
                  <i className="fi fi-sr-phone-rotary"></i>
<p>Talk to sales: (+256)-789-188-726</p>
        </div>
        <Link to="/sales" >
     
        <div style={{ color: "#8da5fe", cursor: "pointer" }}className='login_header'>
        
          <h4 className='font-bold whiteMe'>Get Started</h4>
          {/* <i id='ic' className='icon fi fi-rr-arrow-right'></i> */}
        </div>
        </Link>
      </AnimatedBlock>
    </div>
  );
}

export default Header;
