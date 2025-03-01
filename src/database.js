import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import { join } from 'path'
import { fileURLToPath } from 'url'
import { app } from 'electron'

// Compute __dirname for ES modules
const __filename = fileURLToPath(import.meta.url)

let dbPromise

async function initDB() {
  if (!dbPromise) {
    dbPromise = open({
      filename: join(app.getPath('userData'), 'amc.db'), // changed storage path
      driver: sqlite3.Database
    })
    const db = await dbPromise
    await db.run(`
      CREATE TABLE IF NOT EXISTS services (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_name TEXT,
        serial_number TEXT,
        model TEXT,
        site_code TEXT,
        service_date TEXT,
        amc_end TEXT,
        first_service TEXT,
        second_service TEXT,
        completed INTEGER DEFAULT 0,
        remark TEXT,
        completed_date TEXT
      )
    `)
    
    // Add indexes for frequently queried columns
    await db.run('CREATE INDEX IF NOT EXISTS idx_client_name ON services(client_name)')
    await db.run('CREATE INDEX IF NOT EXISTS idx_site_code ON services(site_code)')
    await db.run('CREATE INDEX IF NOT EXISTS idx_completed ON services(completed)')
    await db.run('CREATE INDEX IF NOT EXISTS idx_service_date ON services(service_date)')
    
    // Add missing columns if they don't exist (for compatibility with older versions)
    try { await db.run(`ALTER TABLE services ADD COLUMN amc_end TEXT`) } catch (e) {}
    try { await db.run(`ALTER TABLE services ADD COLUMN first_service TEXT`) } catch (e) {}
    try { await db.run(`ALTER TABLE services ADD COLUMN second_service TEXT`) } catch (e) {}
    
    // Make sure the amc_end column exists
    try { 
      await db.run(`ALTER TABLE services ADD COLUMN amc_end TEXT`) 
    } catch (e) {
      // Column likely already exists, ignore error
    }
  }
  return await dbPromise
}

export async function addService(service) {
  const db = await initDB()
  try {
    console.log('Database adding service with fields:', {
      ...service,
      amc_end: service.amc_end || null,
    }) // Debug log
    
    const result = await db.run(
      `INSERT INTO services (
        client_name, serial_number, model, site_code, service_date,
        amc_end, first_service, second_service
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      service.client_name,
      service.serial_number,
      service.model,
      service.site_code,
      service.service_date,
      service.amc_end || null,
      service.first_service || null,
      service.second_service || null
    )
    
    // Verify the inserted record
    if (result.lastID) {
      const inserted = await db.get('SELECT * FROM services WHERE id = ?', result.lastID)
      console.log('Inserted record:', inserted) // Debug log
    }
    
    return { success: true, id: result.lastID }
  } catch (error) {
    console.error('Database error:', error)
    return { success: false, error: error.message }
  }
}

// Add batch operations support
export async function batchAddServices(services) {
  const db = await initDB()
  try {
    await db.run('BEGIN TRANSACTION')
    
    for (const service of services) {
      await db.run(
        `INSERT INTO services (
          client_name, serial_number, model, site_code, service_date,
          amc_end, first_service, second_service
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        service.client_name.trim(),
        service.serial_number.trim(),
        service.model.trim(),
        service.site_code.trim(),
        service.service_date,
        service.amc_end || null,
        service.first_service || null,
        service.second_service || null
      )
    }
    
    await db.run('COMMIT')
    return { success: true }
  } catch (error) {
    await db.run('ROLLBACK')
    console.error('Batch add services error:', error)
    return { success: false, error: error.message }
  }
}

// Optimize getReports with better query construction
export async function getReports(filter = {}) {
  const db = await initDB()
  try {
    const params = []
    let sql = `SELECT * FROM services WHERE 1=1`

    if (filter.searchTerm) {
      sql += ` AND (client_name LIKE ? OR site_code LIKE ?)`
      params.push(`%${filter.searchTerm}%`, `%${filter.searchTerm}%`)
    }

    if (filter.serialNumber) {
      sql += ` AND serial_number LIKE ?`
      params.push(`%${filter.serialNumber}%`)
    }

    if (filter.completedStatus === 'completed') {
      sql += ` AND completed = 1`
    } else if (filter.completedStatus === 'notcompleted') {
      sql += ` AND completed = 0`
    }

    sql += ` ORDER BY service_date DESC`
    
    const rows = await db.all(sql, params)
    return rows.map(row => ({
      ...row,
      completed: Boolean(row.completed)
    }))
  } catch (error) {
    console.error('Database error:', error)
    return []
  }
}

export async function toggleCompleted(id, completedDate) {
  const db = await initDB()
  try {
    const row = await db.get(`SELECT completed FROM services WHERE id = ?`, id)
    if (!row) return { success: false, error: 'Service not found' }
    const newState = row.completed ? 0 : 1
    const result = await db.run(
      `UPDATE services SET completed = ?, completed_date = ? WHERE id = ?`,
      newState,
      completedDate || '',
      id
    )
    return {
      success: result.changes > 0,
      completed: newState
    }
  } catch (error) {
    console.error('Toggle completed error:', error)
    return {
      success: false,
      error: 'Failed to update service status'
    }
  }
}

export async function deleteService(id) {
  const db = await initDB()
  try {
    const result = await db.run(`DELETE FROM services WHERE id = ?`, id)
    return {
      success: result.changes > 0,
      message: result.changes > 0 ? 'Service deleted' : 'No service found'
    }
  } catch (error) {
    console.error('Delete service error:', error)
    return {
      success: false,
      error: 'Failed to delete service'
    }
  }
}

export async function completeService(id, remark, completedDate) {
  const db = await initDB()
  try {
    console.log('Database completeService:', { id, remark, completedDate })
    
    const result = await db.run(
      `UPDATE services
       SET completed = 1,
           remark = ?,
           completed_date = ?
       WHERE id = ?`,
      remark || '',
      completedDate || '',
      id
    )

    console.log('Complete result:', result)
    if (result.changes === 0) {
      return { success: false, error: 'No service found with ID: ' + id }
    }
    return { success: true }
  } catch (error) {
    console.error('Database complete error:', error)
    return { success: false, error: error.message }
  }
}

export async function editService(id, updates) {
  const db = await initDB()
  try {
    console.log('Database editService:', { id, updates })
    
    const result = await db.run(
      `UPDATE services 
       SET client_name = ?,
           serial_number = ?,
           model = ?,
           site_code = ?,
           service_date = ?,
           amc_end = ?,
           first_service = ?,
           second_service = ?,
           remark = ?
       WHERE id = ?`,
      updates.client_name,
      updates.serial_number,
      updates.model,
      updates.site_code,
      updates.service_date,
      updates.amc_end || null,
      updates.first_service || null,
      updates.second_service || null,
      updates.remark || null,
      id
    )

    console.log('Update result:', result)
    if (result.changes === 0) {
      return { success: false, error: 'No service found with ID: ' + id }
    }
    return { success: true }
  } catch (error) {
    console.error('Database edit error:', error)
    return { success: false, error: error.message }
  }
}

export async function getServiceById(id) {
  const db = await initDB()
  return db.get(`SELECT * FROM services WHERE id = ?`, id)
}

// Add utility function to vacuum database
export async function optimizeDatabase() {
  const db = await initDB()
  try {
    await db.run('VACUUM')
    return { success: true }
  } catch (error) {
    console.error('Database vacuum error:', error)
    return { success: false, error: error.message }
  }
}

export async function filterBySerialNumber(serialNumber) {
  const db = await initDB()
  try {
    const rows = await db.all(`SELECT * FROM services WHERE serial_number LIKE ?`, `%${serialNumber}%`)
    return rows.map(row => ({
      ...row,
      completed: Boolean(row.completed)
    }))
  } catch (error) {
    console.error('Filter by serial number error:', error)
    return []
  }
}

export default dbPromise