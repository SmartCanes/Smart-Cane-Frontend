import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  const keyPath = env.VITE_PRIVATE_CERTIFICATE_KEY;
  const certPath = env.VITE_PUBLIC_CERTIFICATE_KEY;

  // Create server config conditionally
  const serverConfig = {
    host: true,
    port: 5173,
  };

  // Only add HTTPS if certificates exist
  if (keyPath && certPath && fs.existsSync(keyPath) && fs.existsSync(certPath)) {
    serverConfig.https = {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath)
    };
    console.log("✓ HTTPS enabled with provided certificates");
  } else {
    console.log("ℹ HTTPS not configured. Using HTTP.");
    console.log("Set VITE_PRIVATE_CERTIFICATE_KEY and VITE_PUBLIC_CERTIFICATE_KEY in .env to enable HTTPS");
  }

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src")
      }
    },
    server: serverConfig
  };
});