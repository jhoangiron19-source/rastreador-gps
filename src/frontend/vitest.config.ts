import { fileURLToPath, URL } from "url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

/**
 * Configuración de Vitest para la suite de frontend.
 * Reutiliza los alias de `vite.config.js` (`@` y `declarations`) para que los
 * tests importen los mismos módulos que la aplicación.
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: "declarations",
        replacement: fileURLToPath(new URL("../declarations", import.meta.url)),
      },
      {
        find: "@",
        replacement: fileURLToPath(new URL("./src", import.meta.url)),
      },
    ],
    dedupe: ["@icp-sdk/core"],
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    restoreMocks: true,
    // El pool de forks hereda límites de hilos del contenedor que entran en
    // conflicto; el pool de hilos con límites explícitos es el que funciona acá.
    pool: "threads",
    poolOptions: {
      threads: { minThreads: 1, maxThreads: 1 },
    },
  },
});
