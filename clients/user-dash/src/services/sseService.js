// sseService.js
const SSE_URL = "http://localhost:8080/notify/v1/subscribe";

class SseService {
  constructor() {
    this.eventSource = null;
    this.listeners = new Map();
  }

  connect() {
    if (this.eventSource) {
      console.warn("SSE connection already open.");
      return;
    }

    this.eventSource = new EventSource(SSE_URL);

    this.eventSource.onopen = () => {
      console.log("✅ SSE connection established.");
    };

    this.eventSource.onerror = (error) => {
      console.error("SSE error:", error);
      // Optional: close or reconnect logic
    };

    // Default message handler (optional)
    this.eventSource.onmessage = (event) => {
      console.log("Default message received:", event.data);
    };
  }

  /**
   * Add a listener for a custom event name
   */
  on(eventName, callback) {
    if (!this.eventSource) {
      this.connect();
    }

    const listener = (event) => {
      const data = JSON.parse(event.data);
      callback(data);
    };

    this.eventSource.addEventListener(eventName, listener);
    this.listeners.set(eventName, listener);
  }

  /**
   * Remove listener for a specific event
   */
  off(eventName) {
    const listener = this.listeners.get(eventName);
    if (listener && this.eventSource) {
      this.eventSource.removeEventListener(eventName, listener);
      this.listeners.delete(eventName);
    }
  }

  /**
   * Close the connection
   */
  disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      console.log("🔌 SSE connection closed.");
      this.eventSource = null;
      this.listeners.clear();
    }
  }
}

const sseService = new SseService();
export default sseService;
