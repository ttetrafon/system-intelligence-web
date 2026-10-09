import { defineConfig } from 'vite';
import { resolve } from 'path';

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
        main: './index.html'
      }
    }
  },
  resolve: {
    alias: {
      'lib': resolve(import.meta.dirname, './library')
    }
  },
  // Ensure CSS is handled properly for web components
  css: {
    // Disable CSS modules for web components to prevent scoping issues
    modules: {
      generateScopedName: '[name]__[local]___[hash:base64:5]',
    }
  }
});
