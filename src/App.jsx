import '../browser-electron.js'
import React, { useState, useEffect } from 'react'
import ServiceForm from './components/ServiceForm'
import ReportTable from './components/ReportTable'
import './styles/main.css'
import ErrorBoundary from './components/ErrorBoundary';

const App = () => {
  const [filter, setFilter] = useState({
    timeFrame: '',
    siteCode: '',
    completed: false, // Default to showing pending services
    searchTerm: '',
    startDate: '',
    endDate: '',
    completedStatus: 'notcompleted' // Default to hide completed
  })
  const [data, setData] = useState([])
  const [reload, setReload] = useState(0)
  const [isOptimizing, setIsOptimizing] = useState(false)

  const refreshData = async () => {
    try {
      console.log('Fetching data with filter:', filter);
      const reports = await window.electronAPI.getReports(filter);
      setData(reports || []); // Ensure we always set an array
    } catch (error) {
      console.error('Error fetching data:', error);
      setData([]);
    }
  };

  const handleSearch = ({ searchTerm, startDate, endDate, completedStatus }) => {
    setFilter((prev) => ({
      ...prev,
      searchTerm,
      startDate,
      endDate,
      completedStatus
    }))
  }

  useEffect(() => {
    refreshData()
  }, [filter])

  useEffect(() => {
  // Remove the auto-click code to avoid interfering with manual printing
  // setTimeout(() => {
  //   const printerBtn = document.getElementById('printerButton')
  //   if (printerBtn) {
  //     console.log('Auto-clicking the printer button')
  //     printerBtn.click()
  //   }
  // }, 500)
}, [data])

  const handleFilterChange = (newFilter) => {
    setFilter(prevFilter => ({ ...prevFilter, ...newFilter }))
  }

  return (
    <ErrorBoundary>
      <div className="container">
        <h1 onClick={() => {
          setFilter({
            timeFrame: '',
            siteCode: '',
            completed: false,
            searchTerm: '',
            startDate: '',
            endDate: ''
          })
        }}>
          AMC
        </h1>
        <ServiceForm
          onServiceAdded={refreshData}
          onSearch={handleSearch}
        />
        <ReportTable
          filter={filter}
          data={data}
          onServiceUpdated={refreshData}
        />
      </div>
    </ErrorBoundary>
  )
}

export default App