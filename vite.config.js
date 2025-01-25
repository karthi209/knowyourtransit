import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import mkcert from 'vite-plugin-mkcert';
import fetch from 'node-fetch'; // Import node-fetch

// Ensure fetch is available
global.fetch = fetch;

export default defineConfig(({ mode }) => {
  return {
    plugins: [react(), mkcert()],
    base: '/',  // This should be fine for both production and dev (as both are served from the root)
    server: {
      host: '0.0.0.0',  // Allow external access for local dev
      port: 5173,        // Port for local dev server
      strictPort: true,  // Prevent auto-port switching
      https: false,
    },
    define: {
      'process.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL),  // Dynamically set API URL
    },
  };
});
