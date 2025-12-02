import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { firestore } from '../contexts/firebaseContext';
import { useDatabase } from '../contexts/DatabaseContext';
import { Table, Card, Spin, Statistic, Progress, Input, Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import Logo from '../assets/logo2.png';
import './AdminAnalytics.css';

// Access code for admin analytics (change this to your preferred code)
const ACCESS_CODE = '240680';

function AdminAnalytics() {
  const navigate = useNavigate();
  const { deliveries, allTrucks, allPricingModels, fetchAllTrucksFromAPI, fetchAllPricingModelsFromAPI } = useDatabase();
  const [allDrivers, setAllDrivers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Access control state
  const [isVerified, setIsVerified] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  const [codeError, setCodeError] = useState(false);

  // Fetch all data on mount
  useEffect(() => {
    // Safely call fetch functions if they exist
    if (fetchAllTrucksFromAPI) fetchAllTrucksFromAPI();
    if (fetchAllPricingModelsFromAPI) fetchAllPricingModelsFromAPI();

    // Listen to all drivers
    const driversUnsubscribe = onSnapshot(collection(firestore, 'drivers'), (snapshot) => {
      const driversData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAllDrivers(driversData);
    }, (error) => {
      console.error('Error fetching drivers:', error);
    });

    // Listen to all users (companies)
    const usersUnsubscribe = onSnapshot(collection(firestore, 'users'), (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAllUsers(usersData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching users:', error);
      setLoading(false); // Stop loading even on error
    });

    // Fallback: stop loading after 5 seconds
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 5000);

    return () => {
      driversUnsubscribe();
      usersUnsubscribe();
      clearTimeout(timeout);
    };
  }, [fetchAllTrucksFromAPI, fetchAllPricingModelsFromAPI]);

  // Get unique companies from ALL sources (users, trucks, drivers, deliveries)
  const companies = useMemo(() => {
    const companyMap = new Map();

    // From users
    allUsers.forEach(user => {
      if (user.company && user.accountType !== 'driver') {
        if (!companyMap.has(user.company.toLowerCase())) {
          companyMap.set(user.company.toLowerCase(), {
            name: user.company,
            accountType: user.accountType || 'track-owner',
          });
        }
      }
    });

    // From trucks
    allTrucks.forEach(truck => {
      if (truck.company && !companyMap.has(truck.company.toLowerCase())) {
        companyMap.set(truck.company.toLowerCase(), {
          name: truck.company,
          accountType: 'track-owner',
        });
      }
    });

    // From drivers
    allDrivers.forEach(driver => {
      if (driver.company && !companyMap.has(driver.company.toLowerCase())) {
        companyMap.set(driver.company.toLowerCase(), {
          name: driver.company,
          accountType: 'track-owner',
        });
      }
    });

    // From deliveries (both company and acceptedBy)
    deliveries.forEach(delivery => {
      if (delivery.company && !companyMap.has(delivery.company.toLowerCase())) {
        companyMap.set(delivery.company.toLowerCase(), {
          name: delivery.company,
          accountType: 'cargo-mover',
        });
      }
      if (delivery.acceptedBy && !companyMap.has(delivery.acceptedBy.toLowerCase())) {
        companyMap.set(delivery.acceptedBy.toLowerCase(), {
          name: delivery.acceptedBy,
          accountType: 'track-owner',
        });
      }
    });

    console.log('Companies found:', Array.from(companyMap.values()));
    return Array.from(companyMap.values());
  }, [allUsers, allTrucks, allDrivers, deliveries]);

  // Calculate company statistics
  const companyStats = useMemo(() => {
    console.log('All pricing models:', allPricingModels);
    console.log('Sample deliveries:', deliveries.slice(0, 2));

    return companies.map(company => {
      const companyTrucks = allTrucks.filter(t => t.company?.toLowerCase() === company.name?.toLowerCase());
      const companyDrivers = allDrivers.filter(d => d.company?.toLowerCase() === company.name?.toLowerCase());
      const companyDeliveries = deliveries.filter(d =>
        d.company?.toLowerCase() === company.name?.toLowerCase() ||
        d.acceptedBy?.toLowerCase() === company.name?.toLowerCase()
      );

      const completedDeliveries = companyDeliveries.filter(d => d.status === 'delivered' || d.status === 'completed');
      const activeDeliveries = companyDeliveries.filter(d =>
        d.status === 'in_transit' || d.status === 'en_route' || d.status === 'active' || d.status === 'accepted'
      );
      const pendingDeliveries = companyDeliveries.filter(d => d.status === 'pending');

      // Get pricing model for this company - try multiple field matches
      const pricingModel = allPricingModels?.find(p =>
        p.company?.toLowerCase() === company.name?.toLowerCase() ||
        p.id?.toLowerCase() === company.name?.toLowerCase().replace(/\s+/g, '-')
      );

      // Calculate total distance and earnings
      let totalDistance = 0;
      let totalEarnings = 0;

      companyDeliveries.forEach(delivery => {
        // Distance
        if (delivery.distance) {
          totalDistance += Number(delivery.distance) || 0;
        }

        // Earnings - first check calculatedPrice
        if (delivery.calculatedPrice) {
          totalEarnings += Number(delivery.calculatedPrice) || 0;
        } else if (pricingModel) {
          // Calculate using pricing model
          if (pricingModel.ratePerKm && delivery.distance) {
            totalEarnings += pricingModel.ratePerKm * (Number(delivery.distance) || 0);
          }
          if (pricingModel.ratePerTon && delivery.weight) {
            const weightInTons = (Number(delivery.weight) || 0) / 1000;
            totalEarnings += pricingModel.ratePerTon * weightInTons;
          }
        } else {
          // Fallback: use weight with default rate if no pricing model
          if (delivery.weight) {
            const weightInTons = (Number(delivery.weight) || 0) / 1000;
            totalEarnings += 1250 * weightInTons; // Default rate
          }
        }
      });

      console.log(`Company ${company.name}: deliveries=${companyDeliveries.length}, earnings=${totalEarnings}, pricingModel=`, pricingModel);

      return {
        key: company.name,
        name: company.name,
        type: company.accountType,
        trucks: companyTrucks.length,
        drivers: companyDrivers.length,
        totalDeliveries: companyDeliveries.length,
        completed: completedDeliveries.length,
        active: activeDeliveries.length,
        pending: pendingDeliveries.length,
        totalDistance: Math.round(totalDistance),
        totalEarnings: Math.round(totalEarnings),
        ratePerKm: pricingModel?.ratePerKm || 0,
        ratePerTon: pricingModel?.ratePerTon || 0
      };
    });
  }, [companies, allTrucks, allDrivers, deliveries, allPricingModels]);

  // Platform-wide totals
  const platformTotals = useMemo(() => {
    return {
      totalCompanies: companies.length,
      totalTrucks: allTrucks.length,
      totalDrivers: allDrivers.length,
      totalDeliveries: deliveries.length,
      totalEarnings: companyStats.reduce((sum, c) => sum + c.totalEarnings, 0),
      totalDistance: companyStats.reduce((sum, c) => sum + c.totalDistance, 0),
      activeDeliveries: deliveries.filter(d => ['in_transit', 'en_route', 'active', 'accepted'].includes(d.status)).length,
      completedDeliveries: deliveries.filter(d => ['delivered', 'completed'].includes(d.status)).length
    };
  }, [companies, allTrucks, allDrivers, deliveries, companyStats]);

  // Format currency
  const formatCurrency = useCallback((amount) => `UGX ${Math.round(amount).toLocaleString()}`, []);

  // Access code handlers
  const handleCodeSubmit = useCallback(() => {
    if (accessCode === ACCESS_CODE) {
      setIsVerified(true);
      setCodeError(false);
      message.success('Access granted');
    } else {
      setCodeError(true);
      message.error('Invalid access code');
    }
  }, [accessCode]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter') {
      handleCodeSubmit();
    }
  }, [handleCodeSubmit]);

  // Show access code popup if not verified
  if (!isVerified) {
    return (
      <div className="access-code-overlay">
        <div className="access-code-container">
          {/* Left side - branding */}
          <div className="access-code-branding">
            <div className="branding-content">
              <img src={Logo} alt="Navis" className="access-logo" />
              <h1>Platform Analytics</h1>
              <p>Monitor your entire logistics network from a single dashboard. Track companies, fleets, drivers, and earnings in real-time.</p>
              <div className="branding-features">
                <div className="branding-feature">
                  <i className="fi fi-rr-chart-pie"></i>
                  <span>Real-time metrics</span>
                </div>
                <div className="branding-feature">
                  <i className="fi fi-rr-building"></i>
                  <span>Multi-company overview</span>
                </div>
                <div className="branding-feature">
                  <i className="fi fi-rr-truck-side"></i>
                  <span>Fleet tracking</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - form */}
          <div className="access-code-form-side">
            <button className="back-home-btn" onClick={() => navigate('/')}>
              <i className="fi fi-rr-arrow-left"></i>
              <span>Back to Home</span>
            </button>

            <div className="access-code-form">
              <div className="access-code-icon">
                <i className="fi fi-rr-shield-check"></i>
              </div>
              <h2>Secure Access</h2>
              <p>Enter your 6-digit admin code to access the analytics dashboard</p>

              <div className="code-input-wrapper">
                <label>Access Code</label>
                <Input.Password
                  value={accessCode}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setAccessCode(val);
                    setCodeError(false);
                  }}
                  onKeyPress={handleKeyPress}
                  placeholder="------"
                  maxLength={6}
                  status={codeError ? 'error' : ''}
                  className="access-code-input"
                />
                {codeError && <span className="code-error">Invalid access code. Please try again.</span>}
              </div>

              <Button
                type="primary"
                onClick={handleCodeSubmit}
                disabled={accessCode.length !== 6}
                block
                className="verify-btn"
              >
                <i className="fi fi-rr-unlock"></i>
                Unlock Dashboard
              </Button>

              <p className="access-note">
                <i className="fi fi-rr-info"></i>
                Contact your administrator if you don't have an access code
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="admin-loading">
        <Spin size="large" />
        <p>Loading platform analytics...</p>
      </div>
    );
  }

  // Table columns - will be added in the next part
  const columns = [
    { title: 'Company', dataIndex: 'name', key: 'name', fixed: 'left', width: 150 },
    { title: 'Type', dataIndex: 'type', key: 'type', width: 100,
      render: (type) => <span className={`company-type ${type}`}>{type}</span>
    },
    { title: 'Trucks', dataIndex: 'trucks', key: 'trucks', width: 80, align: 'center' },
    { title: 'Drivers', dataIndex: 'drivers', key: 'drivers', width: 80, align: 'center' },
    { title: 'Deliveries', dataIndex: 'totalDeliveries', key: 'totalDeliveries', width: 100, align: 'center' },
    { title: 'Active', dataIndex: 'active', key: 'active', width: 80, align: 'center',
      render: (val) => <span className="status-active">{val}</span>
    },
    { title: 'Completed', dataIndex: 'completed', key: 'completed', width: 100, align: 'center',
      render: (val) => <span className="status-completed">{val}</span>
    },
    { title: 'Distance (km)', dataIndex: 'totalDistance', key: 'totalDistance', width: 120, align: 'right',
      render: (val) => val.toLocaleString()
    },
    { title: 'Earnings', dataIndex: 'totalEarnings', key: 'totalEarnings', width: 150, align: 'right',
      render: (val) => formatCurrency(val)
    }
  ];

  return (
    <div className="admin-analytics">
      {/* Header */}
      <div className="admin-header">
        <button className="header-back-btn" onClick={() => navigate('/')}>
          <i className="fi fi-rr-arrow-left"></i>
        </button>
        <div className="admin-title">
          <h1>Platform Analytics</h1>
          <p>Overview of all companies, trucks, drivers, and earnings</p>
        </div>
        <div className="admin-badge">
          <i className="fi fi-rr-shield-check"></i> Root Access Only
        </div>
      </div>

      {/* Platform Overview Cards */}
      <div className="platform-stats-grid">
        <Card className="stat-card primary">
          <Statistic title="Total Companies" value={platformTotals.totalCompanies} prefix={<i className="fi fi-rr-building"></i>} />
        </Card>
        <Card className="stat-card">
          <Statistic title="Total Trucks" value={platformTotals.totalTrucks} prefix={<i className="fi fi-rr-truck-side"></i>} />
        </Card>
        <Card className="stat-card">
          <Statistic title="Total Drivers" value={platformTotals.totalDrivers} prefix={<i className="fi fi-rr-user"></i>} />
        </Card>
        <Card className="stat-card">
          <Statistic title="Total Deliveries" value={platformTotals.totalDeliveries} prefix={<i className="fi fi-rr-box"></i>} />
        </Card>
        <Card className="stat-card success">
          <Statistic title="Platform Earnings" value={formatCurrency(platformTotals.totalEarnings)} prefix={<i className="fi fi-rr-coins"></i>} />
        </Card>
        <Card className="stat-card">
          <Statistic title="Total Distance" value={`${platformTotals.totalDistance.toLocaleString()} km`} prefix={<i className="fi fi-rr-road"></i>} />
        </Card>
      </div>

      {/* Delivery Status Overview */}
      <div className="delivery-status-section">
        <Card title="Delivery Status Overview" className="status-card">
          <div className="status-bars">
            <div className="status-item">
              <span>Active Deliveries</span>
              <Progress
                percent={Math.round((platformTotals.activeDeliveries / Math.max(platformTotals.totalDeliveries, 1)) * 100)}
                strokeColor="#52c41a"
                format={() => platformTotals.activeDeliveries}
              />
            </div>
            <div className="status-item">
              <span>Completed Deliveries</span>
              <Progress
                percent={Math.round((platformTotals.completedDeliveries / Math.max(platformTotals.totalDeliveries, 1)) * 100)}
                strokeColor="#722ed1"
                format={() => platformTotals.completedDeliveries}
              />
            </div>
            <div className="status-item">
              <span>Pending Deliveries</span>
              <Progress
                percent={Math.round(((platformTotals.totalDeliveries - platformTotals.activeDeliveries - platformTotals.completedDeliveries) / Math.max(platformTotals.totalDeliveries, 1)) * 100)}
                strokeColor="#faad14"
                format={() => platformTotals.totalDeliveries - platformTotals.activeDeliveries - platformTotals.completedDeliveries}
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Company Details Table */}
      <Card title="Company Performance" className="company-table-card">
        <Table
          dataSource={companyStats}
          columns={columns}
          scroll={{ x: 1200 }}
          pagination={{ pageSize: 10 }}
          size="middle"
        />
      </Card>

      {/* Top Performers */}
      <div className="top-performers-grid">
        <Card title="Top Earners" className="top-card">
          {companyStats
            .sort((a, b) => b.totalEarnings - a.totalEarnings)
            .slice(0, 5)
            .map((company, index) => (
              <div key={company.name} className="top-item">
                <span className="rank">#{index + 1}</span>
                <span className="company-name">{company.name}</span>
                <span className="value">{formatCurrency(company.totalEarnings)}</span>
              </div>
            ))}
        </Card>
        <Card title="Most Active (Deliveries)" className="top-card">
          {companyStats
            .sort((a, b) => b.totalDeliveries - a.totalDeliveries)
            .slice(0, 5)
            .map((company, index) => (
              <div key={company.name} className="top-item">
                <span className="rank">#{index + 1}</span>
                <span className="company-name">{company.name}</span>
                <span className="value">{company.totalDeliveries} deliveries</span>
              </div>
            ))}
        </Card>
        <Card title="Largest Fleets" className="top-card">
          {companyStats
            .sort((a, b) => b.trucks - a.trucks)
            .slice(0, 5)
            .map((company, index) => (
              <div key={company.name} className="top-item">
                <span className="rank">#{index + 1}</span>
                <span className="company-name">{company.name}</span>
                <span className="value">{company.trucks} trucks</span>
              </div>
            ))}
        </Card>
      </div>
    </div>
  );
}

export default AdminAnalytics;

