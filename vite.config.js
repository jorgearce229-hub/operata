import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.png'],
      manifest: {
        name: 'Operata — Trading Journal',
        short_name: 'Operata',
        description: 'Diario de trading inteligente. Registra, analiza y mejora tus operaciones.',
        theme_color: '#0B2E4A',
        background_color: '#0B2E4A',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        icons: [
          { src: '/pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/pwa-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // No cachear las llamadas a la API (Stripe, webhook, etc.) ni a Supabase — siempre deben ir a la red,
        // para que la app nunca muestre datos financieros desactualizados por estar "offline-first" ahí.
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/skwjfzugcehgkxywmdxb\.supabase\.co\/.*/i,
            handler: 'NetworkOnly',
          },
        ],
      },
    }),
  ],
})
