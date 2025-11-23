import { io } from "socket.io-client";

const WS_URL =
  import.meta.env.VITE_MIDDLEWARE_WS_URL || "http://localhost:4000";

class SocketAPI {
  constructor() {
    this.socket = null;
  }

  connect() {
    if (this.socket) return;

    this.socket = io(WS_URL, {
      transports: ["websocket"],
      reconnectionAttempts: 5
    });

    this.socket.on("connect", () => {
      console.log("Connected to Socket.IO server:", this.socket.id);
    });

    this.socket.on("disconnect", () => {
      console.log("Disconnected from server");
    });

    this.socket.on("connect_error", (err) => {
      console.error("Connection error:", err.message);
    });
  }

  on(event, callback) {
    if (!this.socket) this.connect();
    this.socket.on(event, callback);
  }

  emit(event, payload) {
    if (!this.socket) this.connect();
    this.socket.emit(event, payload);
  }
}

export const wsApi = new SocketAPI();
