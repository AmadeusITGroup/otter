import {
  crx,
} from '@crxjs/vite-plugin';
import {
  defineConfig,
} from 'vite';
import manifest from './src/manifest';

// https://vitejs.dev/config/
export default defineConfig(() => {
  return {
    plugins: [crx({ manifest })]
  };
});
