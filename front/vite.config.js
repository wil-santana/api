import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Escuta em 0.0.0.0 permitindo conexões de outros dispositivos na mesma rede local
    port: 3000,
    open: true
  }
});
