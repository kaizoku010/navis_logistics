import React from "react";
import "./footer.css";
import Arrow from "../assets/arrow.png"
import { useNavigate } from "react-router-dom";

function Footer() {
const navigation =  useNavigate() 

    const createAccount=()=>{
        
        navigation("./sales");
    }

  return (
    <div className="footer" class="footer">
      <div className="top-footer">
        <div className="useful_links">
          <div className="footer-links">
            <h4 className="footer-links-heading">Product</h4>
            <div className="link-img">
            <p className="footer-link">Pricing</p>
            {/* <img className="arrow" src={Arrow}/> */}
            </div>
            <div className="link-img">
            <p className="footer-link">Overview</p>
            {/* <img className="arrow" src={Arrow}/> */}
            </div> 
         
            <div className="link-img">
            <p className="footer-link">Plan Routes</p>
            {/* <img className="arrow" src={Arrow}/> */}
            </div>
            <div className="link-img">
            <p className="footer-link">Proof Of Delivery</p>
            {/* <img className="arrow" src={Arrow}/> */}
            </div>
            <div className="link-img">
            <p className="footer-link">Customer Notifications</p>
            {/* <img className="arrow" src={Arrow}/> */}
            </div>
        
          </div>
          <div className="footer-links">
            <h4 className="footer-links-heading">Tools</h4>
    
            <div className="link-img">
            <p className="footer-link">IOS App</p>
            <img className="arrow" src={Arrow}/>
            </div>
            <div className="link-img">
            <p className="footer-link">On Android</p>
            <img className="arrow" src={Arrow}/>
            </div> 
      
       
        
          </div>  <div className="footer-links">
            <h4 className="footer-links-heading">Resources</h4>
            <div className="link-img">
            <p className="footer-link">Blog</p>
            {/* <img className="arrow" src={Arrow}/> */}
            </div>
            <div className="link-img">
            <p className="footer-link">Truck Monitering</p>
            {/* <img className="arrow" src={Arrow}/> */}
            </div> 
        
                   <div className="link-img">
                   <p className="footer-link">Driver Monitering</p>
                   {/* <img className="arrow" src={Arrow}/> */}
            </div>
        
            {/* <div className="link-img">
            <p className="footer-link">Link One</p>
            <img className="arrow" src={Arrow}/>
            </div>
            <div className="link-img">
            <p className="footer-link">Link One</p>
            <img className="arrow" src={Arrow}/>
            </div> */}
        
          </div>
          
          <div className="footer-links">
          
            <h4 className="footer-links-heading">Company</h4>
            <div className="link-img">
            <p className="footer-link">Jobs</p>
            {/* <img className="arrow" src={Arrow}/> */}
            </div>
                   <div className="link-img">
            <p className="footer-link">About</p>
            {/* <img className="arrow" src={Arrow}/> */}
            </div>
          
            <div className="link-img">
            <p className="footer-link">Support</p>
            {/* <img className="arrow" src={Arrow}/> */}
            </div>
    
          </div>
        </div>
        <div className="reach-out-section">
        <h4 className="footer-links-heading white">Start Here ?</h4>

<button onClick={createAccount} className="footer-btn">Request Demo</button>
<button   className="rc-btn">Reach Out</button>

        </div>
      </div>

      <div className="lower-footer">
        <div className="lf-div">
                <div className="footer-location">
                <i class="fi fi-sr-navigation"></i>
                <p>Kampala, Uganda</p>
                    </div>
                <div className="footer-socials">
                <i class="fi fi-brands-whatsapp"></i>
                <p>Whatsapp</p>

                </div>
        </div>
      </div>
    </div>
  );
}

export default Footer;
