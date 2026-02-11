// @ts-check
import { defineConfig } from 'astro/config';
import aws from 'astro-sst';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
  // 'server' for dynamic, 'static' for static site
  output: 'static',

  adapter: aws(),

  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [react(), mdx()],
});