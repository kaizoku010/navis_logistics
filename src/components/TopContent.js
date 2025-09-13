import React, { useEffect, useState } from 'react';
import './topcontent.css';
import Map from '../assets/hero_img.png';
import Cubes from './Cubes';
import Drivers from '../assets/drivers_.png';
import RoutesImage from '../assets/routes.png';
import Deliveries from '../assets/deliveries.png';
import Map_ from "../assets/drivers_map.png"
import Map_2 from "../assets/ttcon.png"
import OP from "../assets/stops.png"
import ANA from "../assets/ana.png"
import Lady from "../assets/1.jpg"
import Lady2 from "../assets/2.jpg"
import Del from "../assets/del.png"
import TruckerMap from "../assets/ship.png"
import {useNavigate} from "react-router-dom"

import Footer from './Footer';

function TopContent() {
  const [bgColor, setBgColor] = useState('rgba(255, 255, 255, 1)'); // Initial background color
  const [lineHeight, setLineHeight] = useState(0); // Initial height of the white line
  const [ballPosition, setBallPosition] = useState(0); // Initial position of the ball
const navigation = useNavigate();


  const handleScroll = () => {
    const section = document.querySelector('.hero_section3');
    const rect = section.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    
    // Calculate the total height of the scrollable area
    const sectionTop = rect.top + window.scrollY;
    const sectionHeight = rect.height;
    const scrollableHeight = sectionHeight + windowHeight;
  
    // Calculate scroll progress as a percentage of the scrollable area
    const scrollTop = window.scrollY;
    const scrollProgress = Math.min((scrollTop - sectionTop + windowHeight) / scrollableHeight, 1);
    if (rect.top <= windowHeight && rect.bottom >= 0) {
      const progress = Math.min((windowHeight - rect.top) / windowHeight, 1);
    // Update background color based on scroll progress
    const r = Math.round(255 + progress * (17 - 255));
    const g = Math.round(255 + progress * (33 - 255));
    const b = Math.round(255 + progress * (64 - 255));
    const color = `rgb(${r}, ${g}, ${b})`;
    setBgColor(color);
    }
    // Update line height to scroll fully to the end of the section
    const maxLineHeight = sectionHeight; // Full height of the section
    setLineHeight(scrollProgress * maxLineHeight);
  
    // Update ball position to move proportionally with the line
    const maxBallPosition = sectionHeight - 10; // Maximum position of the ball
    setBallPosition(scrollProgress * maxBallPosition);
  };
  

  const start = ()=>{
navigation("/start")
  }

  const sales = ()=>{
    navigation("/login")
      }
  

      
  const createAccount = ()=>{
    navigation("/regesiter")
      }
  
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll); // Cleanup
  }, []);

  return (
    <div className='top-content2' style={{ backgroundColor: bgColor }}>
      <div className='hero_section'>
        <div className='text_hero'>
          <h1 className='f-text'>Reduce your delivery costs by 20%</h1>
          <p className='boost'>
            Boost route efficiency, scale easily, and simplify delivery route planning with the world's most popular driver app and delivery software.
          </p>
          <div className='btnArea'>
            <button onClick={start} className='newBtn resizebtn'>Deliver Items</button>
            <button onClick={sales} className='newBtn resizebtn2 contact'>Truck Owner</button>
          </div>
        </div>
        <div className='imageside'>
          {/* <img className='hero_image' src={Map}/> */}
        </div>
      </div>
      {/* lower div */}
      <div className='tw-gradient'>
<div className='tw-gradient-top' >
  <div className='twg-txt'>
<p className='ai-powered-text'>NAVIS AI POWERED SERVICES</p>
<p className='ai-powered-text2'>For businesses with multiple drivers</p>
  </div>
  <div className='tw-gradient-inner-top'>
<div className='twg-div1'>
  <h4 className='twg-title'>Delivery management software</h4>
  <h4 className='twg-subTitle'>for multi-driver teams</h4>
  <p className='twg-p'>Optimize routes instantly, handle delivery in real time, and boost your team’s productivity with a simple dispatcher dashboard and driver app.</p>
  <button onClick={createAccount} className='twg-btn'>Start here</button>
  </div>


  <div className='twg-images'> 

<img className='twg-image-one' src={Lady} alt="Lady" />
<img className='twg-image-one2' src={Lady2} alt="Lady 2" />

  </div>
  </div>

</div>
</div>
      <div className='hero_section2'>
        <div className='items_section'>
          <div className='item_holder'>
            <p className='why-us'>Why Navis?</p>
            <h3 className='why_sub'>A Navis delivery is efficient from start to finish</h3>
            <div className='cubes'>
              <Cubes
                image={RoutesImage}
                desc={'Plan, optimize, and assign routes faster. Instantly adapt to last-minute changes with live tracking and route management'}
                title={'Dispatchers'}
              />
              <Cubes
                image={Drivers}
                desc={'Easy-to-follow app saves time and fuel. Drivers can create routes, react to updates in real-time and share proof of delivery.'}
                title={'Drivers'}
              />
              <Cubes
                image={Deliveries}
                desc={'Automatic customer notifications provide accurate ETAs and tracking, reducing the likelihood of failed deliveries.'}
                title={'Deliveries'}
              />
            </div>
          </div>
        </div>
      </div>
      {/* White line that moves as we scroll */}
      <div className='map_drivers_title'>
<h4 className='how_txt'>HOW DOES IT WORK?</h4>
<h4 className='sync_txt'>A Synchronized delivery software for dispatchers and track owners.</h4>

      </div>
      <div className='hero_section3' style={{ backgroundColor: bgColor }}>
      <div className='right_map2'>
      <img className='manage_drivers' src={Map_} alt="Map showing driver routes" />    

<img className='manage_drivers' src={Map_2} alt="Map showing delivery tracking" />    

      </div>

        <div className='white-line-container'>
        
          <div className='white-line' style={{ height: `${lineHeight}px` }}></div>
          <div className='circle' style={{ top: `${ballPosition}px` }}></div>    
        </div>

        <div className='right_map'>
          <div className='right_map_content'>
<h4 className='track-title'>Track and manage deliveries or drivers in real time</h4>
         <p className="am-desc">Handle last-minute issues with live route tracking and editing. Maintain friction-free delivery by updating all users simultaneously</p>
         <div className='trm'>
         <i style={{color:"#e24e90"}} className='icon' id='ic_trm' class="fi fi-bs-car-journey"></i>
<div className='trm_txt'>
  <p className='trm_title'>Optimize Your Routes</p>
  <p className='trm_desc'>The best route is created by considering every factor that could impact delivery</p>
</div>
         </div>

         <div className='trm'>
         <i style={{color:"gold"}} className='icon' id='ic_trm' class="fi fi-sr-messages"></i>
<div className='trm_txt'>
  <p className='trm_title'>Send instant updates</p>
  <p className='trm_desc'>
  Keep your drivers and customers up to date with real-time notifications    </p>
</div>
         </div>

          </div>
          <div className='right_map_content'>
            
<h4 className='track-title'>Create fully optimized delivery routes</h4>
         <p className="am-desc">Save countless hours by calculating the most efficient route in just one click. Organize your operations with custom delivery zones.</p>
         <div className='trm'>
         <i style={{color:"lime"}} className='icon' id='ic_trm' class="fi fi-bs-pencil"></i>
<div className='trm_txt'>
  <p className='trm_title'>Edit live routes</p>
  <p className='trm_desc'>The best route is created by considering every factor that could impact delivery</p>
</div>
         </div>
          </div>
          

        </div>
      </div>
      <div className='testHolder'>
      <Cubes desc={"In-app photos and signatures collected by drivers are instantly visible to dispatchers, providing a paper trail for dispute resolution"} title={"Proof Of Delivery"} image={OP}/>
        <Cubes desc={"Track, analyze, and report on key metrics to gain valuable operational insight and identify areas of poor performance performance"} title={"Delivery analytics"} image={Del}/>
        <Cubes desc={"In-app photos and signatures collected by drivers are instantly visible to dispatchers, providing a paper trail for dispute resolution"} title={"Minimize missed stops"} image={ANA}/>
      </div>
   <div className='getStarted'>
<h4 className='getStarted-title'>GET STARTED</h4>
<h4 className='reduce-text'>Reduce your delivery costs by 20% with Navis AI</h4>
  <button onClick={start} className='start-here'>Start Here</button>
      <img className='shipment-image' src={TruckerMap} alt="Truckers on a map" />
   </div>
<Footer/>
  
    </div>
  );
}

export default TopContent;
