import React, { useMemo, useCallback, useState, useEffect } from 'react'
import { useReactTable, getCoreRowModel, getFilteredRowModel, getSortedRowModel, flexRender } from '@tanstack/react-table'
import { format, parseISO } from 'date-fns'
import CompleteModal from './CompleteModal'
import EditModal from './EditModal'

// Use memo for row rendering
const TableRow = React.memo(({ row, onEdit, onDelete, onMarkCompleted }) => {
  return (
    <tr className={row.original.completed ? 'completed' : ''}>
      {row.getVisibleCells().map(cell => (
        <td key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </td>
      ))}
    </tr>
  )
})

const ReportTable = ({ data = [], filter, onServiceUpdated }) => {
  const [showCompleteModal, setShowCompleteModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [serviceToComplete, setServiceToComplete] = useState(null)
  const [selectedService, setSelectedService] = useState(null)

  // Memoize handlers to prevent unnecessary re-renders
  const handleMarkCompleted = useCallback((service) => {
    setServiceToComplete(service)
    setShowCompleteModal(true)
  }, [])

  const handleCompleteConfirmed = useCallback(async (payload) => {
    try {
      console.log('Sending complete request:', payload)
      const result = await window.electronAPI.completeService(payload.id, {
        remark: payload.remark,
        completedDate: payload.completedDate
      })
      
      if (result.success) {
        setShowCompleteModal(false)
        setServiceToComplete(null)
        onServiceUpdated()
      } else {
        alert('Failed to mark as completed: ' + (result.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error marking service as completed:', error)
      alert('Error completing service')
    }
  }, [onServiceUpdated])

  const handleEdit = useCallback((service) => {
    setSelectedService(service)
    setShowEditModal(true)
  }, [])

  const handleSaveEdit = useCallback(async (formData) => {
    try {
      console.log('Sending edit request:', formData)
      const result = await window.electronAPI.editService(formData.id, formData)
      
      if (result.success) {
        setShowEditModal(false)
        setSelectedService(null)
        onServiceUpdated() // Refresh data
      } else {
        alert('Failed to update service: ' + (result.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Edit error:', error)
      alert('Error updating service')
    }
  }, [onServiceUpdated])

  const handleDelete = useCallback(async (id) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return
    
    try {
      const result = await window.electronAPI.deleteService(id)
      if (result.success) {
        onServiceUpdated()
      } else {
        alert('Failed to delete service: ' + (result.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error deleting service:', error)
      alert('Error deleting service')
    }
  }, [onServiceUpdated])

  // Debug the data received from props
  useEffect(() => {
    if (data && data.length > 0) {
      console.log('Sample record:', data[0]) // Debug log
    }
  }, [data])

  // Memoize columns definition to ensure "First Service" column is included
  const columns = useMemo(() => [
    {
      header: 'Customer',
      accessorKey: 'client_name'
    },
    {
      header: 'Serial',
      accessorKey: 'serial_number'
    },
    {
      header: 'Model',
      accessorKey: 'model'
    },
    {
      header: 'Site Code',
      accessorKey: 'site_code'
    },
    {
      header: 'AMC Start',
      accessorFn: row => row.service_date
        ? format(parseISO(row.service_date), 'dd/MM/yyyy')
        : ''
    },
    {
      header: 'AMC End',
      accessorFn: row => {
        console.log('AMC End value:', row.amc_end) // Debug log
        return row.amc_end
          ? format(parseISO(row.amc_end), 'dd/MM/yyyy')
          : '-'
      }
    },
    {
      header: 'First Service',
      accessorFn: row => row.first_service
        ? format(parseISO(row.first_service), 'dd/MM/yyyy')
        : ''
    },
    {
      header: 'Second Service',
      accessorFn: row => row.second_service
        ? format(parseISO(row.second_service), 'dd/MM/yyyy')
        : ''
    },
    {
      header: 'Remark',
      accessorKey: 'remark',
      cell: info => info.getValue() || '-'
    },
    {
      header: 'Actions',
      id: 'actions', // Add explicit id to prevent duplication
      cell: ({ row }) => {
        if (row.original.completed) {
          return (
            <button onClick={() => handleDelete(row.original.id)}>
              Delete
            </button>
          )
        } else {
          return (
            <>
              <button onClick={() => handleMarkCompleted(row.original)}>
                Complete
              </button>
              <button onClick={() => handleEdit(row.original)}>
                Edit
              </button>
              <button onClick={() => handleDelete(row.original.id)}>
                Delete
              </button>
            </>
          )
        }
      }
    }
  ], [handleMarkCompleted, handleEdit, handleDelete])

  // Memoize filtered data
  const filteredData = useMemo(() => {
    if (!Array.isArray(data)) return []
    
    return data.filter(item => {
      // Apply completed status filter
      if (filter?.completedStatus === 'completed' && !item.completed) return false;
      if (filter?.completedStatus === 'notcompleted' && item.completed) return false;

      // Apply search term filter
      if (filter?.searchTerm) {
        const term = filter.searchTerm.toLowerCase();
        if (!item.client_name?.toLowerCase().includes(term) &&
            !item.site_code?.toLowerCase().includes(term)) {
          return false;
        }
      }

      return true;
    });
  }, [data, filter])

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel()
  })

  // Only re-render when these change
  const tableRows = useMemo(() => table.getRowModel().rows, [table])

  // Add data validation check
  useEffect(() => {
    if (!Array.isArray(data)) {
      console.error('ReportTable received invalid data:', data);
      return;
    }
  }, [data]);

  // Add error boundary for table rendering
  const renderTable = () => {
    try {
      return (
        <div className="table-container">
          <table>
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id} onClick={header.column.getToggleSortingHandler()}>
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {{ asc: ' ↑', desc: ' ↓' }[header.column.getIsSorted()] ?? null}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map(row => (
                  <TableRow 
                    key={row.id}
                    row={row}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onMarkCompleted={handleMarkCompleted}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length}>No records found</td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={columns.length}>
                  Total Records: {filteredData.length}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      );
    } catch (error) {
      console.error('Table render error:', error);
      return <div>Error rendering table</div>;
    }
  };

  return (
    <div className="report-table-container">
      {renderTable()}
      {showCompleteModal && (
        <CompleteModal
          service={serviceToComplete}
          onClose={() => setShowCompleteModal(false)}
          onComplete={handleCompleteConfirmed}
        />
      )}

      {showEditModal && (
        <EditModal
          service={selectedService}
          onClose={() => setShowEditModal(false)}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  )
}

export default React.memo(ReportTable)