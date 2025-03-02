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
  const [success, setSuccess] = useState(false);

  // Helper function to make text uppercase for customer names
  const makeUppercase = (text) => {
    if (!text) return '';
    return text.toUpperCase();
  };

  // Helper function to capitalize first letter of each word for site codes
  const capitalizeWords = (text) => {
    if (!text) return '';
    return text
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Real-time capitalization as user types
  const handleCustomerNameChange = (e) => {
    setCustomerName(makeUppercase(e.target.value));
  };

  const handleSiteCodeChange = (e) => {
    setSiteCode(capitalizeWords(e.target.value));
  };

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess(false);

    // Apply formatting and validate
    const formattedName = makeUppercase(customerName.trim());
    const formattedSiteCode = capitalizeWords(siteCode.trim());
    const formattedSerialNumber = serialNumber.trim();
    const formattedModel = model.trim();

    if (!formattedName || !formattedSerialNumber || !formattedModel || 
        !formattedSiteCode || !serviceDate.trim()) {
      setError('All required fields must be filled')
      return
    }

    const service = {
      client_name: formattedName,
      serial_number: formattedSerialNumber,
      model: formattedModel,
      site_code: formattedSiteCode,
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
        
        // Show success message and redirect
        setSuccess(true);
        setTimeout(() => {
          // Call the onServiceAdded callback after a short delay to show success message
          onServiceAdded();
        }, 1000);
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
      {success && <p className="success">Service added successfully! Redirecting to search...</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Customer Name</label>
          <input
            type="text"
            placeholder="Customer Name"
            value={customerName}
            onChange={handleCustomerNameChange}
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
            onChange={handleSiteCodeChange}
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