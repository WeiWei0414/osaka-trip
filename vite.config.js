import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  // 👇 新增這一行！ '/osaka-trip/' 必須跟你剛剛在 GitHub 取的專案名稱一模一樣
  // 如果你的專案名稱叫 'my-app'，這裡就寫 '/my-app/'
  base: '/osaka-trip/', 
})