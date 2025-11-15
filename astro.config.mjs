// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import tailwindcss from "@tailwindcss/vite";
import icon from "astro-icon";

// https://astro.build/config
export default defineConfig({
  integrations: [
    mdx({
      extendMarkdownConfig: true,
    }),
    icon({
      include: {
        'simple-icons': ['modrinth'],
      },
    }),
  ],

  markdown: {
    shikiConfig: {
      theme: "github-dark",
    },
  },

  vite: {
    plugins: [tailwindcss()],
  },
});
