import '../browser-electron.js'
import React from 'react'
import { HashRouter as Router, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom'
import ServiceForm from './components/ServiceForm'
import SearchServices from './components/SearchServices'
import ReportTable from './components/ReportTable'
import './styles/main.css'
import ErrorBoundary from './components/ErrorBoundary'

// Create a wrapper component for ServiceForm that can use useNavigate
const ServiceFormWithNavigation = () => {
  const navigate = useNavigate();
  
  const handleServiceAdded = () => {
    // Navigate to the search-services route after successful service addition
    navigate('/search-services');
  };
  
  return <ServiceForm onServiceAdded={handleServiceAdded} onSearch={() => {}} />;
};

const App = () => {
  const handlePrint = () => {
    window.print()
  }

  return (
    <ErrorBoundary>
      <Router>
        <div>
          <nav className="navigation horizontal" style={{ padding: '0px', top:"0px" }}>
            <Link to="/add-service">
              <div className="nav-icon">
                <span role="img" aria-label="Add AMC Service">➕</span>
                <p>Add AMC</p>
              </div>
            </Link>
            <Link to="/search-services">
              <div className="nav-icon">
                <span role="img" aria-label="Search Services">🔍</span>
                <p>Search </p>
              </div>
            </Link>
            <div className="nav-icon" onClick={handlePrint} style={{ cursor: 'pointer' }}>
              <span role="img" aria-label="Print">🖨️</span>
              <p>Print</p>
            </div>
          </nav>
          <div id="auto-selected-title" style={{ display: 'none' }}>
            AMC Tracking Report
          </div>
          <Routes>
            <Route path="/" element={<Navigate to="/search-services" />} />
            <Route path="/add-service" element={<ServiceFormWithNavigation />} />
            <Route path="/search-services" element={<SearchServices />} />
          </Routes>
        </div>
      </Router>
    </ErrorBoundary>
  )
}

export default App