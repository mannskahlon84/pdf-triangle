import { defineConfig } from 'vite';
import { geminiBackendPlugin } from './src/backend/geminiApi.js';

export default defineConfig({
  server: {
    port: 5173 // standard Vite port for local testing
  },
  plugins: [geminiBackendPlugin()]
});
