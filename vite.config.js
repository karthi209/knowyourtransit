import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  return {
    plugins: [react()],
    base: '/',  // This should be fine for both production and dev (as both are served from the root)
    server: {
      host: '0.0.0.0',  // Allow external access for local dev
      port: 5173,        // Port for local dev server
      strictPort: true,  // Prevent auto-port switching
    },
    define: {
      'process.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL),  // Dynamically set API URL
      'process.env.VITE_MOCK_LOCATION': JSON.stringify(process.env.VITE_MOCK_LOCATION), // Expose mock location env var
    },
  };
});