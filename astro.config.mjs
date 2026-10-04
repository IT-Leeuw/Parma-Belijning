import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://parma-belijning.nl',
  trailingSlash: 'always',
  integrations: [
    tailwind(),
  ],
});
