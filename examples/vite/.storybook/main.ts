import type { StorybookConfig } from "@storybook/web-components-vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { mergeConfig } from "vite";

const mdxReactShim = fileURLToPath(
  new URL("../node_modules/@storybook/addon-docs/dist/mdx-react-shim.js", import.meta.url)
);

const config: StorybookConfig = {
  stories: ["../storybook/**/*.mdx", "../storybook/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-docs", "@storybook/addon-a11y"],
  core: {
    builder: {
      name: "@storybook/builder-vite",
      options: {
        viteConfigPath: ".storybook/vite.config.storybook-only.ts",
      },
    },
    disableTelemetry: true,
  },
  framework: {
    name: "@storybook/web-components-vite",
    options: {},
  },
  docs: {
    defaultName: "Docs",
  },
  async viteFinal(config) {
    return mergeConfig(config, {
      plugins: [react()],
      resolve: {
        alias: [
          {
            find: /^file:\/\/\/.*\/node_modules\/@storybook\/addon-docs\/dist\/mdx-react-shim\.js$/,
            replacement: mdxReactShim,
          },
        ],
      },
    });
  },
};

export default config;
