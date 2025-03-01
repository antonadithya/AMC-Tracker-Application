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
    const result = await db.run(
      `INSERT INTO services (O services (
        client_name, serial_number, model, site_code, service_date,el, site_code, service_date,
        amc_end, first_service, second_servicerst_service, second_service
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      service.client_name,
      service.serial_number,
      service.model,
      service.site_code,
      service.service_date,
      service.amc_end || null,ull,
      service.first_service || null,|| null,
      service.second_service || null_service || null
    )
     id: result.lastID }
    // Verify the inserted record
    if (result.lastID) { error)
      await db.get('SELECT * FROM services WHERE id = ?', result.lastID)error.message }
    }
    
    return { success: true, id: result.lastID }
  } catch (error) {support
    console.error('Database error:', error)
    return { success: false, error: error.message }
  } {
}await db.run('BEGIN TRANSACTION')

// Add batch operations supportice of services) {
export async function batchAddServices(services) {
  const db = await initDB()
  try {       client_name, serial_number, model, site_code, service_date,
    await db.run('BEGIN TRANSACTION')         amc_end, first_service, second_service
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    for (const service of services) {m(),
      await db.run(
        `INSERT INTO services (),
          client_name, serial_number, model, site_code, service_date, service.site_code.trim(),
          amc_end, first_service, second_service
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,    service.amc_end || null,
        service.client_name.trim(),,
        service.serial_number.trim(),ond_service || null
        service.model.trim(),
        service.site_code.trim(),
        service.service_date,
        service.amc_end || null,
        service.first_service || null,
        service.second_service || null
      )
    }ices error:', error)
    error: error.message }
    await db.run('COMMIT')
    return { success: true }
  } catch (error) {
    await db.run('ROLLBACK')mize getReports with better query construction
    console.error('Batch add services error:', error)t async function getReports(filter = {}) {
    return { success: false, error: error.message }nst db = await initDB()
  }
}
CT * FROM services WHERE 1=1`
// Optimize getReports with better query construction
export async function getReports(filter = {}) {
  const db = await initDB() LIKE ?)`
  try {   params.push(`%${filter.searchTerm}%`, `%${filter.searchTerm}%`)
    const params = []   }
    let sql = `SELECT * FROM services WHERE 1=1`

    if (filter.searchTerm) {
      sql += ` AND (client_name LIKE ? OR site_code LIKE ?)`etedStatus === 'notcompleted') {
      params.push(`%${filter.searchTerm}%`, `%${filter.searchTerm}%`)ql += ` AND completed = 0`
    }

    if (filter.serialNumber) {    sql += ` ORDER BY service_date DESC`
      sql += ` AND serial_number LIKE ?`
      params.push(`%${filter.serialNumber}%`)
    }
 ...row,
    if (filter.completedStatus === 'completed') {      completed: Boolean(row.completed)
      sql += ` AND completed = 1`
    } else if (filter.completedStatus === 'notcompleted') {
      sql += ` AND completed = 0`
    }eturn []
  }
    sql += ` ORDER BY service_date DESC`
    
    const rows = await db.all(sql, params)
    return rows.map(row => ({
      ...row, {
      completed: Boolean(row.completed)    const row = await db.get(`SELECT completed FROM services WHERE id = ?`, id)
    }))rror: 'Service not found' }
  } catch (error) {const newState = row.completed ? 0 : 1
    console.error('Database error:', error)
    return []mpleted = ?, completed_date = ? WHERE id = ?`,
  }e,
}
d
export async function toggleCompleted(id, completedDate) {
  const db = await initDB()
  try {: result.changes > 0,
    const row = await db.get(`SELECT completed FROM services WHERE id = ?`, id)   completed: newState
    if (!row) return { success: false, error: 'Service not found' }   }
    const newState = row.completed ? 0 : 1  } catch (error) {
    const result = await db.run(
      `UPDATE services SET completed = ?, completed_date = ? WHERE id = ?`,
      newState,uccess: false,
      completedDate || '',
      id
    )
    return {
      success: result.changes > 0,
      completed: newStatenction deleteService(id) {
    })
  } catch (error) {
    console.error('Toggle completed error:', error)onst result = await db.run(`DELETE FROM services WHERE id = ?`, id)
    return {
      success: false,
      error: 'Failed to update service status'nges > 0 ? 'Service deleted' : 'No service found'
    }
  }
}

export async function deleteService(id) {
  const db = await initDB()
  try {
    const result = await db.run(`DELETE FROM services WHERE id = ?`, id)
    return {
      success: result.changes > 0,
      message: result.changes > 0 ? 'Service deleted' : 'No service found' remark, completedDate) {
    }
  } catch (error) {
    console.error('Delete service error:', error) })
    return {
      success: false,
      error: 'Failed to delete service'
    }  SET completed = 1,
  } ?,
}
 id = ?`,
export async function completeService(id, remark, completedDate) {
  const db = await initDB()
  try { id
    const result = await db.run( )
      `UPDATE services
       SET completed = 1,    console.log('Complete result:', result)
           remark = ?,
           completed_date = ?se, error: 'No service found with ID: ' + id }
       WHERE id = ?`,
      remark || '',
      completedDate || '',catch (error) {
      idlete error:', error)
    )false, error: error.message }

    if (result.changes === 0) {

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

export default dbPromise