import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'AI Video',
        short_name: 'AI Video',
        description: 'Turn your pictures into fun AI videos',
        theme_color: '#F2F2F7',
        background_color: '#F2F2F7',
        display: 'standalone',
        icons: [
          {
            src: 'favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg}']
      },
      devOptions: {
        enabled: true
      }
    })
  ],
  preview: {
    allowedHosts: ['arnass-mac-mini.tail2509f8.ts.net']
  },
  server: {
    allowedHosts: ['arnass-mac-mini.tail2509f8.ts.net']
  }
})
