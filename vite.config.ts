import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  // GitHub Pages はリポジトリ名のサブパス配下で配信される。
  // dev サーバーまでサブパスにすると開発が面倒なので、ビルド時だけ付ける。
  base: command === 'build' ? '/wanko-todo/' : '/',
}))
