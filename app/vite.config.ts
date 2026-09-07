import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    // exposes the vite web-server to the local network
    // may need to open the specified port in the firewall
    host: true,
    port: 5173
  },
  build: {
    rollupOptions: {
      input: {
        // define multiple separate entry points
        // pages will be individual, not requiring the full package to open each one
        main: './index.html',
        contact: './contact.html'
      }
    }
  }
});
