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
  // eslint-disable-next-line no-undef
  const env = loadEnv(mode, process.cwd(), "");

  const keyPath = env.VITE_PRIVATE_CERTIFICATE_KEY;
  const certPath = env.VITE_PUBLIC_CERTIFICATE_KEY;

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src")
      }
    },
    server: {
      host: true,
      port: 5173,
      https: {
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath)
      }
    }
  };
});
