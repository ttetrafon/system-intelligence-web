import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    // exposes the vite web-server to the local network
    // may need to open the specified port in the firewall
    host: true,
    port: 5173,
    // redirect the requests for cors
    proxy: {
      '/data': { // Proxy all requests from the Vite server's origin
        target: 'http://0.0.0.0:3000',
        changeOrigin: true,
        secure: false
      }
    }
  }
});
