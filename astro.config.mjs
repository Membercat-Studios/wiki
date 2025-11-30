// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import tailwindcss from "@tailwindcss/vite";
import icon from "astro-icon";
import remarkAlert from "remark-github-blockquote-alert";

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
    remarkPlugins: [
      [remarkAlert, {}]
    ]
  },

  vite: {
    plugins: [tailwindcss()],
  },
});
