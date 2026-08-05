import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        index: fileURLToPath(new URL('./index.html', import.meta.url)),
        login: fileURLToPath(new URL('./src/pages/login.html', import.meta.url)),
        register: fileURLToPath(new URL('./src/pages/register.html', import.meta.url)),
        clientRegister: fileURLToPath(new URL('./src/pages/client-register.html', import.meta.url)),
        adminDashboard: fileURLToPath(new URL('./src/pages/admin-dashboard.html', import.meta.url)),
        userAccounts: fileURLToPath(new URL('./src/pages/user-accounts.html', import.meta.url)),
      },
    },
  },
})
