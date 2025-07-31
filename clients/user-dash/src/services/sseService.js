// sseService.js

const SSE_URL = "http://localhost:8080/notify/v1/subscribe";

class SseService {
  constructor() {
    this.eventSource = null;
    this.listeners = new Map();
  }

  connect({ onOpen, onError } = {}) {
    if (this.eventSource) {
      console.warn("SSE connection already open.");
      return;
    }

    this.eventSource = new EventSource(SSE_URL);

    this.eventSource.onopen = () => {
      console.log("SSE connection established.");
      onOpen?.();
    };

    this.eventSource.onerror = (error) => {
      console.error("SSE connection failed:", error);
      onError?.(error);
    };

    // Fallback default
    this.eventSource.onmessage = (event) => {
      console.log("Default message:", event.data);
    };
  }

  on(eventName, callback) {
    if (!this.eventSource) return;
    const listener = (event) => callback(JSON.parse(event.data));
    this.eventSource.addEventListener(eventName, listener);
    this.listeners.set(eventName, listener);
  }

  off(eventName) {
    const listener = this.listeners.get(eventName);
    if (listener && this.eventSource) {
      this.eventSource.removeEventListener(eventName, listener);
      this.listeners.delete(eventName);
    }
  }

  disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
      this.listeners.clear();
      console.log("SSE connection closed.");
    }
  }
}

const sseService = new SseService();
export default sseService;
