import React from 'react'
import "./homepage.css"
import Header from '../components/Header'
import TopContent from '../components/TopContent'

function HomePage() {
  return (
    <div className='homepage'>
    <Header/>
    <div className='content_home'>
<TopContent/>
    </div>


    </div>
  )
}

export default HomePage