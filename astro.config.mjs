// @ts-check
import { defineConfig } from 'astro/config';
import aws from 'astro-sst';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import icon from 'astro-icon';

import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
  // 'server' for dynamic, 'static' for static site
  output: 'static',

  adapter: aws(),
  trailingSlash: 'always',

  vite: {
    plugins: [tailwindcss()],
  },
  image: {
    domains: ['static.corecollective.dev'],
  },

  integrations: [
    react(),
    mdx(),
    icon({
      iconDir: 'src/assets/icons',
    }),
  ],
});
