import { defineConfig } from 'astro/config';
export default defineConfig({
  site: 'https://pnmcguire480.github.io',
  base: '/flockbuilt-demo',
  output: 'static',
  trailingSlash: 'always',
  outDir: './docs',
  build: { format: 'directory' },
  vite: { build: { assetsInlineLimit: 0 } },
});
