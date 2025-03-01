import React, { useState } from 'react'

const ServiceForm = ({ onServiceAdded, onSearch }) => {
  const [customerName, setCustomerName] = useState('')
  const [serialNumber, setSerialNumber] = useState('')
  const [model, setModel] = useState('')
  const [siteCode, setSiteCode] = useState('')
  const [serviceDate, setServiceDate] = useState('')
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [completedStatus, setCompletedStatus] = useState('all')
  const [isPrinterOnly, setIsPrinterOnly] = useState(false)
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

    // Log AMC end date for debugging
    console.log('AMC End value before submit:', amcEnd)

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
      console.log('Submitting service with data:', service)
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

  const handleSearch = () => {
    onSearch({
      searchTerm,
      startDate,
      endDate,
      completedStatus,
      printerOnly: isPrinterOnly
    });
  };

  return (
    <div className="service-form">
      <h2>Add AMC Service</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Customer Name"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Serial Number"
          value={serialNumber}
          onChange={(e) => setSerialNumber(e.target.value)}
        />
        <input
          type="text"
          list="modelList"
          placeholder="Model"
          value={model}
          onChange={(e) => setModel(e.target.value)}
        />
        <datalist id="modelList">
          <option value="Epson PLQ 20" />
          <option value="Epson PLQ 35" />
          <option value="Epson PLQ 40" />
          <option value="Epson PLQ 50" />
          <option value="LQ-310" />
          <option value="2190II" />
          <option value="M3180" />
        </datalist>
        <input
          type="text"
          placeholder="Site Code"
          value={siteCode}
          onChange={(e) => setSiteCode(e.target.value)}
        />
        <input
          type="date"
          placeholder="Service Date (AMC Start)"
          value={serviceDate}
          onChange={(e) => setServiceDate(e.target.value)}
        />
          <input
            type="date"
            value={amcEnd}
            onChange={(e) => {
              console.log('Setting AMC End to:', e.target.value)
              setAmcEnd(e.target.value)
            }}
          />
      
      
        <button type="submit">Add Service</button>
      </form>

      <div className="search-section">
        <input
          type="text"
          placeholder="Search by Customer or Site"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            // Trigger search on each change
            onSearch({
              searchTerm: e.target.value,
              startDate,
              endDate,
              completedStatus,
              printerOnly: isPrinterOnly
            });
          }}
        />
        
        <select
          value={completedStatus}
          onChange={(e) => {
            setCompletedStatus(e.target.value);
            // Trigger search on status change
            onSearch({
              searchTerm,
              startDate,
              endDate,
              completedStatus: e.target.value,
              printerOnly: isPrinterOnly
            });
          }}
        >
          <option value="all">All</option>
          <option value="completed">Completed</option>
          <option value="notcompleted">Not Completed</option>
        </select>
       
        <button type="button" onClick={handleSearch}>
          Search
        </button>

        <button
          id="printerButton"
          type="button"
          onClick={() => {
            setIsPrinterOnly(!isPrinterOnly)
            onSearch({
              searchTerm,
              startDate,
              endDate,
              completedStatus,
              printerOnly: !isPrinterOnly
            })
            // Short delay allows table to update before printing
            setTimeout(() => {
              window.print()
            }, 700)
          }}
        >
          🖨
        </button>
      </div>
    </div>
  )
}

export default ServiceForm