// ...existing code...
ipcMain.handle('delete-service', async (_, id) => {
  try {
    return await deleteService(id)
  } catch (error) {
    console.error('Delete service error:', error)
    return { success: false, error: error.message }
  }
})

ipcMain.handle('edit-service', async (_, id, updates) => {
  try {
    return await editService(id, updates)
  } catch (error) {
    console.error('Edit service error:', error)
    return { success: false, error: error.message }
  }
})

ipcMain.handle('toggle-completed', async (_, id, completedDate, remark) => {
  try {
    return await completeService(id, remark, completedDate)
  } catch (error) {
    console.error('Toggle completed error:', error)
    return { success: false, error: error.message }
  }
})

ipcMain.handle('add-service', async (_, service) => {
  try {
    console.log('Received add-service request:', service) // Debug log
    const result = await addService(service)
    console.log('Add service result:', result) // Debug log
    return result
  } catch (error) {
    console.error('Add service error:', error)
    return {
      success: false,
      error: error.message
    }
  }
})

ipcMain.handle('filter-by-serial-number', async (_, serialNumber) => {
  try {
    return await filterBySerialNumber(serialNumber)
  } catch (error) {
    console.error('Filter by serial number error:', error)
    return { success: false, error: error.message }
  }
})
// ...existing code...
