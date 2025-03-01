import React from 'react'

const RemarkModal = ({ onClose }) => {
  const handleProceed = () => {
    window.electronAPI.openCompletionWindow()
    onClose()
  }

  return (
    <div className="remark-modal">
      <div className="modal-content">
        <h3>Completion Remark</h3>
        <div className="modal-actions">
          <button onClick={handleProceed}>Proceed</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  )
}

export default RemarkModal
