import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import "../react-file-viewer-playground";

type StoryArgs = {
  defaultExample: "image" | "pdf" | "csv" | "xlsx" | "docx" | "pptx";
  allowUpload: boolean;
  allowExampleSwitch: boolean;
  viewerHeight: number;
  omit: string[];
  fallbackTitle: string;
  theme: "auto" | "light" | "dark";
};

const meta: Meta<StoryArgs> = {
  title: "Library/FileViewer",
  parameters: {
    layout: "fullscreen",
  },
  argTypes: {
    defaultExample: {
      control: "inline-radio",
      options: ["image", "pdf", "csv", "xlsx", "docx", "pptx"],
    },
    viewerHeight: {
      control: { type: "range", min: 320, max: 720, step: 20 },
    },
    omit: {
      control: "object",
    },
    fallbackTitle: {
      control: "text",
    },
    theme: {
      control: "inline-radio",
      options: ["auto", "light", "dark"],
    },
  },
  render: (args) => html`
    <div style="margin: 0; padding: 16px; box-sizing: border-box; overflow-x: clip;">
      <react-file-viewer-playground
        .defaultExample=${args.defaultExample}
        .allowUpload=${args.allowUpload}
        .allowExampleSwitch=${args.allowExampleSwitch}
        .viewerHeight=${args.viewerHeight}
        .omit=${args.omit}
        .fallbackTitle=${args.fallbackTitle}
        .theme=${args.theme}
      ></react-file-viewer-playground>
    </div>
  `,
};

export default meta;

type Story = StoryObj<StoryArgs>;

export const InteractivePreview: Story = {
  name: "Interactive preview",
  args: {
    defaultExample: "image",
    allowUpload: true,
    allowExampleSwitch: true,
    viewerHeight: 420,
    omit: [],
    fallbackTitle: "This preview type is intentionally disabled for the current example.",
    theme: "auto",
  },
};

export const PdfSample: Story = {
  name: "PDF sample",
  args: {
    defaultExample: "pdf",
    allowUpload: false,
    allowExampleSwitch: false,
    viewerHeight: 420,
    omit: [],
    fallbackTitle: "This preview type is intentionally disabled for the current example.",
    theme: "auto",
  },
};

export const XlsxSample: Story = {
  name: "XLSX sample",
  args: {
    defaultExample: "xlsx",
    allowUpload: false,
    allowExampleSwitch: false,
    viewerHeight: 420,
    omit: [],
    fallbackTitle: "This preview type is intentionally disabled for the current example.",
    theme: "auto",
  },
};

export const CsvSample: Story = {
  name: "CSV sample",
  args: {
    defaultExample: "csv",
    allowUpload: false,
    allowExampleSwitch: false,
    viewerHeight: 420,
    omit: [],
    fallbackTitle: "This preview type is intentionally disabled for the current example.",
    theme: "auto",
  },
};

export const DocxSample: Story = {
  name: "DOCX sample",
  args: {
    defaultExample: "docx",
    allowUpload: false,
    allowExampleSwitch: false,
    viewerHeight: 420,
    omit: [],
    fallbackTitle: "This preview type is intentionally disabled for the current example.",
    theme: "auto",
  },
};

export const PptxSample: Story = {
  name: "PPTX sample",
  args: {
    defaultExample: "pptx",
    allowUpload: false,
    allowExampleSwitch: false,
    viewerHeight: 420,
    omit: [],
    fallbackTitle: "This preview type is intentionally disabled for the current example.",
    theme: "auto",
  },
};

export const CustomFallback: Story = {
  name: "Custom fallback",
  args: {
    defaultExample: "pdf",
    allowUpload: false,
    allowExampleSwitch: false,
    viewerHeight: 320,
    omit: ["pdf"],
    fallbackTitle: "PDF preview is disabled in this configuration, so the branded fallback is rendered instead.",
    theme: "auto",
  },
};
