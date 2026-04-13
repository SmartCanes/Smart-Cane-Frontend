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

      const connectCallbacks = this.listeners.get("connect");
      connectCallbacks?.forEach((cb) => cb());

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

      const disconnectCallbacks = this.listeners.get("disconnect");
      disconnectCallbacks?.forEach((cb) => cb(event));

      setTimeout(() => this.connect(), 3000);
    };

    this.socket.onerror = (err) => {
      console.error("WebSocket error:", err);
    };

    this.socket.onmessage = (msg) => {
      try {
        const { event, payload } = JSON.parse(msg.data);
        const callbacks = this.listeners.get(event);
        callbacks?.forEach((cb) => cb(payload));
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
    const existingListeners = this.listeners.get(event) || new Set();
    existingListeners.add(cb);
    this.listeners.set(event, existingListeners);
    this.connect();
  }

  off(event, cb) {
    if (!cb) {
      this.listeners.delete(event);
      return;
    }

    const existingListeners = this.listeners.get(event);
    if (!existingListeners) return;

    existingListeners.delete(cb);

    if (existingListeners.size === 0) {
      this.listeners.delete(event);
      return;
    }

    this.listeners.set(event, existingListeners);
  }

  disconnect() {
    this.socket?.close();
    this.socket = null;
  }

  sendNotes = (message) => {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.off("noteDelivered");
        reject(new Error("Timeout waiting for delivery"));
      }, 15000);

      this.on("noteDelivered", (payload) => {
        clearTimeout(timeout);
        this.off("noteDelivered");

        if (payload?.success) {
          resolve({ success: true });
        } else {
          reject(new Error(payload?.error || "Delivery failed"));
        }
      });

      this.emit("note", { message });
    });
  };

  async updateDeviceState(configPayload) {
    return new Promise((resolve, reject) => {
      const requestId = crypto.randomUUID();
      console.log(configPayload);

      const handler = (payload) => {
        if (payload?.requestId !== requestId) return;

        clearTimeout(timeout);
        this.off("configSaved", handler);

        if (payload?.success) {
          resolve(payload);
        } else {
          reject(new Error(payload?.error || "Config save failed"));
        }
      };

      const timeout = setTimeout(() => {
        this.off("configSaved", handler);
        reject(new Error("Config save timeout"));
      }, 8000);

      this.on("configSaved", handler);
      this.emit("updateDeviceConfig", {
        ...configPayload,
        requestId
      });
    });
  }

  async updatePiConfig(piPayload) {
    return new Promise((resolve, reject) => {
      const handleSuccess = (payload) => {
        clearTimeout(timeout);
        this.off("piConfigUpdated", handleSuccess);
        this.off("piConfigError", handleError);
        resolve(payload);
      };

      const handleError = (payload) => {
        clearTimeout(timeout);
        this.off("piConfigUpdated", handleSuccess);
        this.off("piConfigError", handleError);
        reject(new Error(payload || "Pi config update failed"));
      };

      const timeout = setTimeout(() => {
        this.off("piConfigUpdated", handleSuccess);
        this.off("piConfigError", handleError);
        reject(new Error("Pi config update timeout"));
      }, 8000);

      this.on("piConfigUpdated", handleSuccess);
      this.on("piConfigError", handleError);

      this.emit("updatePiConfig", piPayload);
    });
  }

  previewVoice(voicePayload) {
    this.emit("previewVoice", voicePayload);
    return true;
  }
}

export const wsApi = new SocketAPI(() => {
  const selected = useDevicesStore.getState().selectedDevice;
  return selected?.deviceSerialNumber || null;
});
