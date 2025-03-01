import '../browser-electron.js'
import React from 'react'
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom'
import ServiceForm from './components/ServiceForm'
import SearchServices from './components/SearchServices'
import ReportTable from './components/ReportTable'
import './styles/main.css'
import ErrorBoundary from './components/ErrorBoundary'

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
            Auto-Selected Title
          </div>
          <Routes>
            <Route path="/" element={<Navigate to="/search-services" />} />
            <Route path="/add-service" element={<ServiceForm onServiceAdded={() => {}} />} />
            <Route path="/search-services" element={<SearchServices />} />
          </Routes>
        </div>
      </Router>
    </ErrorBoundary>
  )
}

export default App