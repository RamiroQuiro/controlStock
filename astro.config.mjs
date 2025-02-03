// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';

import node from '@astrojs/node';
import tailwind from '@astrojs/tailwind'

// https://astro.build/config
export default defineConfig({
  server: {
    port: 4321,
    host: true,
  },
  devToolbar: {
    enabled: false,
  },
  integrations: [react(), tailwind()],
  outDir: './src',
  output: 'server',
  adapter: node({
    mode: 'standalone',
  }),

});