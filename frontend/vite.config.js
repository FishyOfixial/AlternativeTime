import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      injectRegister: false,
      registerType: "prompt",
      includeAssets: [
        "icons/apple-touch-icon-180.png",
        "icons/pwa-192x192.png",
        "icons/pwa-512x512.png",
        "icons/pwa-maskable-512x512.png"
      ],
      manifest: {
        id: "/",
        name: "Alternative Time Co.",
        short_name: "ATC POS",
        description:
          "Plataforma empresarial para operacion comercial, inventario y ventas de relojeria.",
        theme_color: "#fbf7f0",
        background_color: "#fbf7f0",
        display: "standalone",
        scope: "/",
        start_url: "/login",
        lang: "es-MX",
        icons: [
          {
            src: "/icons/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "/icons/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png"
          },
          {
            src: "/icons/pwa-maskable-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable"
          }
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: []
      },
      devOptions: {
        enabled: true
      }
    })
  ],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
      },
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setup.js",
    globals: true,
    server: {
      deps: {
        inline: ["virtual:pwa-register/react"]
      }
    }
  }
});
