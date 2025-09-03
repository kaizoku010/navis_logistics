import React from 'react'
import "./guybanner.css"
import Guy from "../assets/guy.png"
import { useNavigate } from 'react-router-dom'

function GuyBanner({company, link}) {

const navigate = useNavigate()
  const navigateTo =()=>{
navigate(`/root/${link||"map"}`)
  }

  return (
    <div className='guy-sama'>
        <div className='guy-text-left'>
          <h1 className='greetings'>
          Congratulations {company}! 🎉
          </h1>
            <p className='overview-text'>
            You have done 0% more deliveries this month. Check out your new data in your profile.
            </p>
            <button onClick={navigateTo} className='sales-button'>
              View deliveries  
            </button>
        </div>
        <div className='guy-image'>
            <div className='spacer'></div>
            <img className='guy' src={Guy}/>
        </div>
    </div>
  )
}

export default GuyBanner