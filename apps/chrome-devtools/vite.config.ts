import {
  crx,
} from '@crxjs/vite-plugin';
import {
  defineConfig,
} from 'vite';
import manifest from './src/manifest';

export default defineConfig({
  plugins: [crx({ manifest })]
});
