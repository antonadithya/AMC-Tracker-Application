import React, { useState } from 'react'

const EditModal = ({ service, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    id: service.id,
    client_name: service.client_name || '',
    serial_number: service.serial_number || '',
    model: service.model || '',
    site_code: service.site_code || '',
    service_date: service.service_date?.split('T')[0] || '',
    amc_end: service.amc_end?.split('T')[0] || '',
    first_service: service.first_service?.split('T')[0] || '',
    second_service: service.second_service?.split('T')[0] || '',
    remark: service.remark || ''
  })
  const [success, setSuccess] = useState(false)

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

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Apply formatting before submission
    const updatedData = {
      ...formData,
      client_name: makeUppercase(formData.client_name.trim()),
      site_code: capitalizeWords(formData.site_code.trim()),
      serial_number: formData.serial_number.trim(),
      model: formData.model.trim()
    };
    
    console.log("Submitting form data:", updatedData) // Debug log
    
    // Show success message
    setSuccess(true)
    
    // Wait a moment before closing
    setTimeout(() => {
      onSave(updatedData) // Send formatted data
    }, 1000)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    
    // Apply formatting in real-time for specific fields
    if (name === 'client_name') {
      setFormData(prev => ({ ...prev, [name]: makeUppercase(value) }))
    } 
    else if (name === 'site_code') {
      setFormData(prev => ({ ...prev, [name]: capitalizeWords(value) }))
    } 
    else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  return (
    <div className="modal">
      <div className="modal-content">
        <form onSubmit={handleSubmit}>
          <h3>Edit Service</h3>
          
          {success && <p className="success">Service updated successfully!</p>}
          
          <div className="form-group">
            <label>Customer Name:</label>
            <input
              name="client_name"
              value={formData.client_name}
              onChange={handleChange}
              placeholder="Customer Name"
            />
          </div>
          
          <div className="form-group">
            <label>Serial Number:</label>
            <input
              name="serial_number"
              value={formData.serial_number}
              onChange={handleChange}
              placeholder="Serial Number"
            />
          </div>
          
          <div className="form-group">
            <label>Model:</label>
            <input
              name="model"
              value={formData.model}
              onChange={handleChange}
              placeholder="Model"
              list="modelList"
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
            <label>Site Code:</label>
            <input
              name="site_code"
              value={formData.site_code}
              onChange={handleChange}
              placeholder="Site Code"
            />
          </div>
          
          <div className="form-group">
            <label>AMC Start Date:</label>
            <input
              type="date"
              name="service_date"
              value={formData.service_date}
              onChange={handleChange}
            />
          </div>
          
          <div className="form-group">
            <label>AMC End Date:</label>
            <input
              type="date"
              name="amc_end"
              value={formData.amc_end}
              onChange={handleChange}
            />
          </div>
          
          <div className="form-group">
            <label>First Service:</label>
            <input
              type="date"
              name="first_service"
              value={formData.first_service}
              onChange={handleChange}
            />
          </div>
          
          <div className="form-group">
            <label>Second Service:</label>
            <input
              type="date"
              name="second_service"
              value={formData.second_service}
              onChange={handleChange}
            />
          </div>
          
          <div className="form-group">
            <label>Remark:</label>
            <textarea
              name="remark"
              value={formData.remark}
              onChange={handleChange}
              placeholder="Enter remark"
              style={{ width: '100%', minHeight: '60px' }}
            />
          </div>
          
          <div className="modal-actions">
            <button type="submit">Save</button>
            <button type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditModal
