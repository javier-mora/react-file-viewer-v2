import type { Preview } from "@storybook/web-components-vite";

const preview: Preview = {
  parameters: {
    layout: "padded",
    options: {
      storySort: {
        order: ["Overview", "Library"],
      },
    },
    docs: {
      toc: true,
    },
  },
};

export default preview;
