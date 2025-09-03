import React from 'react'
import "./contact.css"
import {useNavigate} from "react-router-dom"


function Contact() {

    const naviagtion = useNavigate()
    const backHome=()=> naviagtion("/start")
    const login=()=> naviagtion("/login")



    return (
    <div className='contact-us'>
<h1 className='sales-talk'>Talk with our sales team</h1>
<p className='look'>Looking for more information, or want to try out our test application? Choose one of the options below.</p>
   <button onClick={login}  className='demo-btn'>Sign-in</button>
   <button onClick={backHome} className='req-call'>Tell us about your delivery</button>

    </div>
  )
}

export default Contact