const BASE_URL = "http://localhost:8082/notify/v1";

class SseConnection {
  constructor(url) {
    this.url = url;
    this.eventSource = null;
    this.listeners = new Map();
  }

  connect({ onOpen, onError } = {}) {
    if (this.eventSource) {
      console.warn(`SSE already connected to ${this.url}`);
      return;
    }

    this.eventSource = new EventSource(this.url);

    this.eventSource.onopen = () => {
      console.log(`SSE connected to ${this.url}`);
      onOpen?.();
    };

    this.eventSource.onerror = (err) => {
      console.error(`SSE error on ${this.url}`, err);
      onError?.(err);
    };

    this.eventSource.onmessage = (event) => {
      console.log(`Default message from ${this.url}:`, event.data);
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
      console.log(`SSE connection to ${this.url} closed`);
      this.eventSource = null;
      this.listeners.clear();
    }
  }
}

class SseService {
  constructor() {
    this.broadcast = new SseConnection(`${BASE_URL}/subscribe`);
    this.unicast = null; // will be initialized after user login
  }

  connectAll(userName, handlers = {}) {
    this.broadcast.connect(handlers);

    // Create unicast connection if username is available
    if (userName) {
      this.unicast = new SseConnection(`${BASE_URL}/subscribe/${userName}`);
      this.unicast.connect(handlers);
    }
  }

  on(eventName, callback) {
    this.broadcast.on(eventName, callback);
    this.unicast?.on(eventName, callback);
  }

  off(eventName) {
    this.broadcast.off(eventName);
    this.unicast?.off(eventName);
  }

  disconnectAll() {
    this.broadcast.disconnect();
    this.unicast?.disconnect();
    this.unicast = null;
  }
}

const sseService = new SseService();
export default sseService;
