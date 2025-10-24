import React from 'react'
import "./homepage.css"
import Header from '../components/Header'
import TopContent from '../components/TopContent'
import VersionInfo from '../components/VersionInfo'

function HomePage() {
  return (
    <div className='homepage'>
    <Header/>
    <div className='content_home'>
<TopContent/>
    </div>
    <VersionInfo 
      version="7.4.0"
      status="Under Development"
      lastUpdated="Oct 25, 2024"
    />
    </div>
  )
}

export default HomePage