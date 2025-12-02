import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './Features.css';

function Features() {
  const features = [
    {
      icon: 'fi fi-rr-route',
      title: 'Smart Route Optimization',
      description: 'Our AI-powered routing engine calculates the most efficient delivery routes in seconds. Factor in traffic, distance, time windows, and vehicle capacity to minimize fuel costs and maximize deliveries per day.',
      benefits: ['Reduce fuel costs by up to 20%', 'Increase daily deliveries', 'Real-time traffic adaptation']
    },
    {
      icon: 'fi fi-rr-truck-side',
      title: 'Fleet Management',
      description: 'Complete visibility and control over your entire fleet. Track vehicle locations, monitor driver performance, manage maintenance schedules, and optimize vehicle utilization from a single dashboard.',
      benefits: ['Real-time GPS tracking', 'Vehicle health monitoring', 'Maintenance scheduling']
    },
    {
      icon: 'fi fi-rr-users',
      title: 'Driver Management',
      description: 'Empower your drivers with an intuitive mobile app. Easy-to-follow navigation, instant updates, proof of delivery capture, and seamless communication with dispatchers.',
      benefits: ['Mobile driver app', 'Turn-by-turn navigation', 'In-app communication']
    },
    {
      icon: 'fi fi-rr-box-open',
      title: 'Shipment Tracking',
      description: 'End-to-end visibility for every shipment. Cargo owners can create requests, track progress in real-time, and receive instant notifications at every milestone.',
      benefits: ['Live shipment tracking', 'Automated notifications', 'Delivery confirmation']
    },
    {
      icon: 'fi fi-rr-calculator',
      title: 'Dynamic Pricing',
      description: 'Flexible pricing models that adapt to your business. Set rates per kilometer, per ton, or create custom pricing structures. Automatic cost calculation for every delivery.',
      benefits: ['Rate per km pricing', 'Rate per ton pricing', 'Transparent cost breakdown']
    },
    {
      icon: 'fi fi-rr-chart-line-up',
      title: 'Analytics & Reporting',
      description: 'Data-driven insights to optimize your operations. Track performance metrics, identify bottlenecks, analyze trends, and make informed decisions with comprehensive reports.',
      benefits: ['Performance dashboards', 'Custom reports', 'Trend analysis']
    }
  ];

  const userTypes = [
    {
      icon: 'fi fi-rr-shipping-fast',
      title: 'For Cargo Owners',
      description: 'Ship your goods with confidence. Create shipment requests, get competitive quotes from verified transporters, and track your cargo every step of the way.',
      features: ['Easy shipment creation', 'Multiple transporter options', 'Real-time tracking', 'Cost transparency']
    },
    {
      icon: 'fi fi-rr-garage-car',
      title: 'For Fleet Owners',
      description: 'Maximize your fleet utilization. Access delivery requests, manage your drivers and vehicles, set your pricing, and grow your transportation business.',
      features: ['Delivery marketplace', 'Fleet dashboard', 'Driver management', 'Earnings analytics']
    },
    {
      icon: 'fi fi-rr-steering-wheel',
      title: 'For Drivers',
      description: 'Focus on driving, we handle the rest. Get optimized routes, capture proof of delivery, communicate with dispatch, and complete more deliveries efficiently.',
      features: ['Mobile-first app', 'Navigation integration', 'Digital proof of delivery', 'Earnings tracking']
    }
  ];

  return (
    <div className='features-page'>
      <Header />
      
      <div className='features-content'>
        {/* Hero Section */}
        <section className='features-hero'>
          <div className='features-hero-content'>
            <span className='features-badge'>Platform Features</span>
            <h1 className='features-title'>Everything you need to streamline your logistics</h1>
            <p className='features-subtitle'>
              Navis combines powerful technology with intuitive design to help you manage deliveries, 
              optimize routes, and grow your business.
            </p>
          </div>
        </section>

        {/* Main Features Grid */}
        <section className='features-main'>
          <div className='features-grid'>
            {features.map((feature, index) => (
              <div key={index} className='feature-card'>
                <div className='feature-icon'>
                  <i className={feature.icon}></i>
                </div>
                <h3 className='feature-title'>{feature.title}</h3>
                <p className='feature-description'>{feature.description}</p>
                <ul className='feature-benefits'>
                  {feature.benefits.map((benefit, i) => (
                    <li key={i}>
                      <i className='fi fi-rr-check'></i>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* User Types Section */}
        <section className='features-users'>
          <div className='features-users-header'>
            <span className='features-badge'>Built For Everyone</span>
            <h2>One platform, multiple solutions</h2>
            <p>Whether you're shipping goods, managing a fleet, or driving deliveries, Navis has you covered.</p>
          </div>
          
          <div className='user-types-grid'>
            {userTypes.map((userType, index) => (
              <div key={index} className='user-type-card'>
                <div className='user-type-icon'>
                  <i className={userType.icon}></i>
                </div>
                <h3>{userType.title}</h3>
                <p>{userType.description}</p>
                <ul className='user-type-features'>
                  {userType.features.map((feat, i) => (
                    <li key={i}>
                      <i className='fi fi-rr-arrow-right'></i>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}

export default Features;

