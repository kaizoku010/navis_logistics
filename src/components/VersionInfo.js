import React from 'react';
import './versioninfo.css';

/**
 * VersionInfo - A reusable floating box component that displays version information
 * @param {string} version - The version number (defaults to package.json version)
 * @param {string} status - Development status (e.g., "Under Development", "Beta", "Stable")
 * @param {string} lastUpdated - Last update date
 * 
 * import VersionInfo from '../components/VersionInfo';

// Use with custom values
<VersionInfo 
  version="1.0.0"
  status="Beta"
  lastUpdated="Dec 2024"
/>
 */
function VersionInfo({ 
  version = "7.5.0", 
  status = "Under Development", 
  lastUpdated = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}) {
  return (
    <div className="version-info-box">
      <div className="version-info-item">
        <span className="version-info-label">Version:</span>
        <span className="version-info-value">{version}</span>
      </div>
      <div className="version-info-item">
        <span className="version-info-label">Status:</span>
        <span className="version-info-value status">{status}</span>
      </div>
      <div className="version-info-item">
        <span className="version-info-label">Last Updated:</span>
        <span className="version-info-value">{lastUpdated}</span>
      </div>
    </div>
  );
}

export default VersionInfo;
