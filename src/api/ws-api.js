import { handleRequest } from "./requestHandler";
import { middlewareApi } from ".";
import { useDevicesStore } from "@/stores/useStore";
const WS_URL = import.meta.env.VITE_MIDDLEWARE_WS_URL || "ws://localhost:3000";
class SocketAPI {
  constructor(getSerial) {
    this.socket = null;
    this.listeners = new Map();
    this.messageQueue = [];
    this.reconnectAttempts = 5;
    this.getSerial = getSerial; // function to get the selected device serial
  }

  connect() {
    // avoid creating multiple sockets
    if (
      this.socket &&
      (this.socket.readyState === WebSocket.OPEN ||
        this.socket.readyState === WebSocket.CONNECTING)
    )
      return;

    this.socket = new WebSocket(WS_URL);

    this.socket.onopen = () => {
      console.log("Connected to WebSocket server");

      const serial = this.getSerial?.();
      if (serial) {
        const subscribeMessage = { event: "subscribe", serial };

        // Remove any previous subscribe messages in queue
        this.messageQueue = this.messageQueue.filter(
          (m) => m.event !== "subscribe"
        );

        this.socket.send(JSON.stringify(subscribeMessage));
        console.log("WebSocket subscribing to serial:", serial);
      }

      // Flush other queued messages
      while (this.messageQueue.length > 0) {
        const { event, payload } = this.messageQueue.shift();
        this.socket.send(JSON.stringify({ event, payload }));
      }
    };

    this.socket.onclose = (event) => {
      console.log("Disconnected from WebSocket server", event.reason);
      setTimeout(() => this.connect(), 3000); // reconnect
    };

    this.socket.onerror = (err) => {
      console.error("WebSocket error:", err);
    };

    this.socket.onmessage = (msg) => {
      try {
        const { event, payload } = JSON.parse(msg.data);
        const cb = this.listeners.get(event);
        if (cb) cb(payload);
      } catch (e) {
        console.error("Invalid message format", e);
      }
    };
  }

  emit(event, payload = {}) {
    if (!this.socket) {
      this.connect();
    }

    const serial = this.getSerial?.() || null;

    const message = {
      event,
      serial,
      payload
    };

    if (this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
      return;
    }

    this.messageQueue.push({ event, payload });
  }

  on(event, cb) {
    this.listeners.set(event, cb);
    this.connect();
  }

  off(event) {
    this.listeners.delete(event);
  }

  disconnect() {
    this.socket?.close();
    this.socket = null;
  }
}

export const wsApi = new SocketAPI(() => {
  const selected = useDevicesStore.getState().selectedDevice;
  return selected?.deviceSerialNumber || null;
});

export const sendNotes = (message) => {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      wsApi.off("noteDelivered");
      reject(new Error("Timeout waiting for delivery"));
    }, 15000);

    wsApi.on("noteDelivered", (payload) => {
      clearTimeout(timeout);
      wsApi.off("noteDelivered");

      if (payload?.success) {
        resolve({ success: true });
      } else {
        reject(new Error(payload?.error || "Delivery failed"));
      }
    });

    wsApi.emit("note", { message });
  });
};
