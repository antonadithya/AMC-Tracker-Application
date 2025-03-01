const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  getReports: (filter) => ipcRenderer.invoke('get-reports', filter),
  addService: (service) => {
    console.log('Sending addService request:', service) // Debug log
    return ipcRenderer.invoke('add-service', service)
  },
  deleteReport: (id) => ipcRenderer.invoke('delete-service', id),
  editService: (id, updates) => ipcRenderer.invoke('edit-service', id, updates),
  toggleCompleted: (id, completedDate, remark) => 
    ipcRenderer.invoke('toggle-completed', id, completedDate, remark),
})
