import React, { useState } from 'react'

const ServiceForm = ({ onServiceAdded, onSearch }) => {
  const [customerName, setCustomerName] = useState('')
  const [serialNumber, setSerialNumber] = useState('')
  const [model, setModel] = useState('')
  const [siteCode, setSiteCode] = useState('')
  const [serviceDate, setServiceDate] = useState('')
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [completedStatus, setCompletedStatus] = useState('all')
  const [amcEnd, setAmcEnd] = useState('')
  const [firstService, setFirstService] = useState('')
  const [secondService, setSecondService] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validate inputs
    if (!customerName.trim() || !serialNumber.trim() || !model.trim() || 
        !siteCode.trim() || !serviceDate.trim()) {
      setError('All fields are required except AMC End, which is optional but recommended.')
      return
    }

    const service = {
      client_name: customerName.trim(),
      serial_number: serialNumber.trim(),
      model: model.trim(),
      site_code: siteCode.trim(),
      service_date: serviceDate,
      amc_end: amcEnd || null,
      first_service: firstService || null,
      second_service: secondService || null
    }

    try {
      const result = await window.electronAPI.addService(service)
      
      if (result.success) {
        // Clear form
        setCustomerName('')
        setSerialNumber('')
        setModel('')
        setSiteCode('')
        setServiceDate('')
        setAmcEnd('')
        setFirstService('')
        setSecondService('')
        
        // Notify parent component
        onServiceAdded()
      } else {
        setError('Failed to add service: ' + (result.error || 'Unknown error'))
      }
    } catch (err) {
      console.error("Error adding service:", err)
      setError('Failed to add service. Please try again.')
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    onSearch({ searchTerm, completedStatus, serialNumber })
  }

  return (
    <div className="service-form">
      <h2>Add AMC Service</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Customer Name</label>
          <input
            type="text"
            placeholder="Customer Name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Serial Number</label>
          <input
            type="text"
            placeholder="Serial Number"
            value={serialNumber}
            onChange={(e) => setSerialNumber(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Model:</label>
          <input
            type="text"
            list="modelList"
            placeholder="Model"
            value={model}
            onChange={(e) => setModel(e.target.value)}
          />
          <datalist id="modelList">
            <option value="PLQ 20" />
            <option value="PLQ 35" />
            <option value="PLQ 40" />
            <option value="PLQ 50" />
            <option value="LQ-310" />
            <option value="LQ-50" />
            <option value="LQ-2190" />
            <option value="LQ-2190 II" />
            <option value="TM T81 III" />
            <option value="TM 220D" />
            <option value="M3180" />
          </datalist>
        </div>
        <div className="form-group">
          <label>Site Code</label>
          <input
            type="text"
            placeholder="Site Code"
            value={siteCode}
            onChange={(e) => setSiteCode(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>AMC Star Date</label>
          <input
            type="date"
            value={serviceDate}
            onChange={(e) => setServiceDate(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>AMC End Date</label>
          <input
            type="date"
            value={amcEnd}
            onChange={(e) => setAmcEnd(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>First Service</label>
          <input
            type="date"
            value={firstService}
            onChange={(e) => setFirstService(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Second Service</label>
          <input
            type="date"
            value={secondService}
            onChange={(e) => setSecondService(e.target.value)}
          />
        </div>
        <button type="submit">Add Service</button>
      </form>
    </div>
  )
}

export default ServiceForm