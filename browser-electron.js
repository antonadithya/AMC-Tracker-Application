if (!window.process || !window.process.versions || !window.process.versions.electron) {
  // Removed all dummy data references
  if (!window.electronAPI) {
    window.electronAPI = {
      addService: async () => {
        console.warn("addService not available in browser environment - simulating success")
        return { success: true }
      },
      getReports: async () => {
        console.warn("getReports not available in browser environment - returning empty data")
        return []
      },
      markCompleted: async () => {
        console.warn("markCompleted not available in browser environment - simulating success")
        return { success: true }
      }
    }
  }
}
