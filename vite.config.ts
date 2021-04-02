import {defineConfig} from 'vite';
import vue from '@vitejs/plugin-vue';
import config from './config/env.asf';

const dist = '_generated';

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [vue()],
  build: {
    outDir: dist + '/zh'
  }
})
