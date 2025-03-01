import React, { useState } from 'react'

const CompleteModal = ({ onClose, onComplete, service }) => {
  const [remark, setRemark] = useState('')

  const handleSave = () => {
    const filledFields = [
      remark.trim(),
      service?.first_service,
      service?.second_service
    ].filter(field => field && field.trim()).length;

    if (filledFields < 2) {
      alert('Please ensure at least 2 fields are filled:\n- Remark\n- First Service\n- Second Service');
      return;
    }

    onComplete({
      id: service.id,
      remark: remark.trim(),
      completedDate: new Date().toISOString()
    });
  }

  return (
    <div className="modal">
      <div className="modal-content">
        <h3>Complete Service</h3>
        <div className="form-group">
          <label>Remark (Optional):</label>
          <textarea
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            placeholder="Enter remark (optional)"
            style={{ width: '100%', minHeight: '60px' }}
          />
        </div>
        <div className="modal-actions">
          <button onClick={handleSave}>Complete</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  )
}

export default CompleteModal
