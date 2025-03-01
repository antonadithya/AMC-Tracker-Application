import { app, BrowserWindow, ipcMain, crashReporter } from 'electron'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { addService, getReports, toggleCompleted, deleteService, completeService, editService, getServiceById } from './src/database.js'

// Define currentDir using import.meta.url
const currentDir = dirname(fileURLToPath(import.meta.url))

const isDev = process.env.NODE_ENV === 'development'

// Configure crash reporter
crashReporter.start({
  compress: true,
  uploadToServer: false
})

function createWindow () {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: join(currentDir, 'dist/preload/preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  if (isDev) {
    mainWindow.loadURL('http://localhost:3000')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(join(currentDir, 'dist/renderer/index.html'))
  }

  // Handle window close gracefully
  mainWindow.on('close', (e) => {
    if (!app.isQuitting) {
      e.preventDefault()
      mainWindow.hide()
    }
  })
}

app.whenReady().then(createWindow)

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

app.on('before-quit', () => {
  app.isQuitting = true
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

ipcMain.handle('add-service', async (event, service) => {
  try {
    // Validate required fields
    const requiredFields = ['client_name', 'serial_number', 'model', 'site_code', 'service_date']
    const missingFields = requiredFields.filter(field => !service[field])
    
    if (missingFields.length > 0) {
      return {
        success: false,
        error: `Missing required fields: ${missingFields.join(', ')}`
      }
    }

    // Debug log to see what's being passed
    console.log('Electron received service data:', {
      ...service,
      amc_end: service.amc_end
    })

    // Sanitize input - include explicit handling for amc_end
    const sanitizedService = {
      client_name: service.client_name.trim(),
      serial_number: service.serial_number.trim(),
      model: service.model.trim(),
      site_code: service.site_code.trim(),
      service_date: service.service_date,
      amc_end: service.amc_end || null, // Explicitly handle amc_end
      first_service: service.first_service || null,
      second_service: service.second_service || null
    }

    console.log('Passing sanitized service to database:', sanitizedService)
    const result = await addService(sanitizedService)
    return result
  } catch (error) {
    console.error('Add service error:', error)
    return {
      success: false,
      error: 'Failed to add service - ' + error.message
    }
  }
})

ipcMain.handle('get-reports', async (event, filter) => {
  return await getReports(filter)
})

ipcMain.handle('toggle-completed', async (event, id) => {
  try {
    return await toggleCompleted(id)
  } catch (error) {
    console.error('Toggle completed error:', error)
    return { success: false, error: 'Failed to toggle status' }
  }
})

ipcMain.handle('delete-service', async (event, id) => {
  try {
    return await deleteService(id)
  } catch (error) {
    console.error('Delete service error:', error)
    return { success: false, error: 'Failed to delete service' }
  }
})

ipcMain.handle('complete-service', async (event, { id, remark, completedDate }) => {
  try {
    console.log('Completing service:', { id, remark, completedDate }); // Debug log
    
    const service = await getServiceById(id)
    if (!service) {
      return { success: false, error: 'Service not found' }
    }
    
    // Complete the service
    const result = await completeService(id, remark, completedDate)
    console.log('Complete result:', result); // Debug log
    return result
  } catch (error) {
    console.error('Complete service error:', error)
    return { success: false, error: 'Failed to complete service' }
  }
})

ipcMain.handle('edit-service', async (event, { id, updates }) => {
  try {
    console.log('Editing service:', { id, updates }); // Debug log
    
    if (!id || !updates) {
      return { 
        success: false, 
        error: 'Missing id or updates data' 
      };
    }

    const result = await editService(id, updates);
    console.log('Edit result:', result); // Debug log
    return result;
  } catch (error) {
    console.error('Edit service error:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to edit service' 
    };
  }
})

ipcMain.handle('open-completion-window', () => {
  const newWindow = new BrowserWindow({
    width: 400,
    height: 250,
    title: 'Service Completion',
    webPreferences: {
      contextIsolation: true
    }
  })
  // Load a simple HTML or React page that shows completion details
  newWindow.loadFile(join(currentDir, 'dist/renderer/completionWindow.html'))
})