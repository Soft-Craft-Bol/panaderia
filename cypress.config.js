import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173', // El puerto por defecto de Vite es 5173
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
})