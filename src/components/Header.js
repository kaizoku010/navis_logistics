import React from 'react';
import "./header.css";
import "../mobile.css";
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

  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 768);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className={`header_div ${isMobileMenuOpen ? 'overlay' : ''}`} onClick={isMobileMenuOpen ? toggleMobileMenu : null}>
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
        </AnimatedBlock>
        <div className={`button_holder ${isMobileMenuOpen ? 'mobile_menu_open' : ''}`}>
            <div className="close_mobile_menu" onClick={toggleMobileMenu}>
              <i className="fi fi-rr-cross-small"></i>
            </div>
            <button className='header_btn'>Home</button>
            <button className='header_btn'>Features</button>
            <button className='header_btn'>Pricing</button>
            <Link to="/sales">
              <button className='header_btn'>Contact</button>
            </Link>
            <div className='contact-header-mobile'>
              <i className="fi fi-sr-phone-rotary"></i>
              <p>Talk to sales: (+256)-789-188-726</p>
            </div>
            <Link to="/sales" >
              <div style={{ color: "#8da5fe", cursor: "pointer" }} className='login_header_mobile'>
                <h4 className='font-bold whiteMe'>Get Started</h4>
              </div>
            </Link>
        </div>
        <div
          style={{
            flex: 1,
          }}
        >
        </div>
        {!isMobile && (
          <>
            <div className='contact-header'>
              <i className="fi fi-sr-phone-rotary"></i>
              <p>Talk to sales: (+256)-789-188-726</p>
            </div>
            <Link to="/sales" >
              <div style={{ color: "#8da5fe", cursor: "pointer" }}className='login_header'>
                <h4 className='font-bold whiteMe'>Get Started</h4>
              </div>
            </Link>
          </>
        )}
        <div className="mobile_menu_button" onClick={toggleMobileMenu}>
          <i className={`fi fi-rr-${isMobileMenuOpen ? 'close' : 'menu-burger'}`}></i>
        </div>
      </AnimatedBlock>
    </div>
  );
}

export default Header;
