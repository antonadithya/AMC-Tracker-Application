// A simple queue to prevent database operations from overlapping

class DBOperationQueue {
  constructor() {
    this.queue = [];
    this.processing = false;
  }

  async enqueue(operation) {
    return new Promise((resolve, reject) => {
      this.queue.push({
        operation,
        resolve,
        reject
      });
      
      if (!this.processing) {
        this.processQueue();
      }
    });
  }
  
  async processQueue() {
    if (this.processing || this.queue.length === 0) {
      return;
    }
    
    this.processing = true;
    const { operation, resolve, reject } = this.queue.shift();
    
    try {
      const result = await Promise.race([
        operation(),
        new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Database operation timed out')), 10000);
        })
      ]);
      resolve(result);
    } catch (error) {
      console.error('Database operation failed:', error);
      reject(error);
    } finally {
      this.processing = false;
      // Process next item in queue
      setTimeout(() => this.processQueue(), 50);
    }
  }
}

// Create singleton instance
const dbQueue = new DBOperationQueue();
export default dbQueue;
