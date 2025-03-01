import React, { useState, useEffect } from 'react'
import ReportTable from './ReportTable'

const SearchServices = () => {
  const [filter, setFilter] = useState({
    searchTerm: '',
    completedStatus: 'all',
    serialNumber: ''
  })
  const [data, setData] = useState([])

  const refreshData = async () => {
    try {
      console.log('Fetching data with filter:', filter)
      const reports = await window.electronAPI.getReports(filter)
      setData(reports || []) // Ensure we always set an array
    } catch (error) {
      console.error('Error fetching data:', error)
      setData([])
    }
  }

  const handleSearch = ({ searchTerm, completedStatus, serialNumber }) => {
    setFilter((prev) => ({
      ...prev,
      searchTerm,
      completedStatus,
      serialNumber // Include serial number in filter
    }))
  }

  const handleReset = () => {
    setFilter({
      searchTerm: '',
      completedStatus: 'all',
      serialNumber: ''
    })
    refreshData()
  }

  useEffect(() => {
    refreshData()
  }, [filter])

  return (
    <div className="search-services">
      <h2>Search Services</h2>
      <form onSubmit={(e) => {
        e.preventDefault()
        handleSearch(filter)
      }}>
        <input
          type="text"
          placeholder="Search by Customer or Site"
          value={filter.searchTerm}
          onChange={(e) => setFilter({ ...filter, searchTerm: e.target.value })}
        />
        <input
          type="text"
          placeholder="Search by Serial Number"
          value={filter.serialNumber}
          onChange={(e) => setFilter({ ...filter, serialNumber: e.target.value })}
        />
        <select
          value={filter.completedStatus}
          onChange={(e) => setFilter({ ...filter, completedStatus: e.target.value })}
        >
          <option value="all">All</option>
          <option value="completed">Completed</option>
          <option value="notcompleted">Not Completed</option>
        </select>
        <button type="submit">Search</button>
        <button type="button" onClick={handleReset}>Reset</button>
      </form>
      <ReportTable
        filter={filter}
        data={data}
        onServiceUpdated={refreshData}
      />
    </div>
  )
}

export default SearchServices
