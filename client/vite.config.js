import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import flowbiteReact from 'flowbite-react/plugin/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss(), flowbiteReact()],
  server: {
    host: true,
    port: 5173,
    allowedHosts: true,
  },
});
