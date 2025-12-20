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
  const isProd = mode === "production";

  const serverConfig = {
    host: true,
    port: 5173
  };

  if (isProd) {
    const keyPath = env.VITE_PRIVATE_CERTIFICATE_KEY;
    const certPath = env.VITE_PUBLIC_CERTIFICATE_KEY;

    if (
      keyPath &&
      certPath &&
      fs.existsSync(keyPath) &&
      fs.existsSync(certPath)
    ) {
      serverConfig.https = {
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath)
      };
      console.log("✓ HTTPS enabled for production");
    } else {
      console.warn(
        "⚠ HTTPS not configured for production. Set VITE_PRIVATE_CERTIFICATE_KEY and VITE_PUBLIC_CERTIFICATE_KEY"
      );
    }
  } else {
    console.log("ℹ Development mode: using HTTP");
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
