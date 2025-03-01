import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  addService: (data) => ipcRenderer.invoke('add-service', data),
  getReports: (filter) => ipcRenderer.invoke('get-reports', filter),
  editService: (id, updates) => {
    console.log('Preload editService:', { id, updates })
    return ipcRenderer.invoke('edit-service', { id, updates })
  },
  deleteService: (id) => ipcRenderer.invoke('delete-service', id),
  completeService: (id, data) => {
    console.log('Preload completeService:', { id, data })
    return ipcRenderer.invoke('complete-service', { id, ...data })
  },
  optimizeDatabase: () => ipcRenderer.invoke('optimize-database')
})