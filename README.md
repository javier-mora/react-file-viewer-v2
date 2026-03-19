# react-file-viewer-v2

> Extendable file viewer for web

[Live demo](https://javier-mora.github.io/react-file-viewer-v2/?path=/docs/overview--docs)

[![NPM](https://img.shields.io/npm/v/react-file-viewer-v2.svg)](https://www.npmjs.com/package/react-file-viewer-v2) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

**react-file-viewer-v2** is a browser-first React library for previewing files on the web, inspired by [react-file-viewer](https://github.com/plangrid/react-file-viewer).

Compatible with React 17, 18, and 19 through peer dependencies.

## Install

```bash
npm install --save react-file-viewer-v2
```

The public Storybook documentation is published to GitHub Pages from the isolated example app under `examples/vite`.

## Supported file formats

- Images: png, jpeg, gif
- pdf
- docx
- xlsx
- pptx
- Video: mp4, webm
- Audio: mp3

## Usage

There is one main React component, `FileViewer`, that takes the following props:

- `fileType` string: type of resource to be shown, for example `png` or `pdf`
- `file` blob: `Blob` of the resource to be shown by the FileViewer
- `unsupportedComponent` react element [optional]: custom component rendered when the file format is not supported
- `omit` string[] [optional]: list of built-in drivers to disable
- `theme` "auto" | "light" | "dark" [optional]: toolbar appearance for supported viewers, defaults to `auto`

```tsx
import React from "react";
import { FileViewer } from "react-file-viewer-v2";

export function Example({ file }: { file: Blob }) {
  return <FileViewer file={file} fileType="pdf" theme="auto" />;
}
```

## Storybook locally

```bash
npm install
npm run build
npm --prefix examples/vite install
npm --prefix examples/vite run storybook
```

For the static build:

```bash
npm run build
npm --prefix examples/vite run build-storybook
npm --prefix examples/vite run storybook:serve
```

### React 17 note

If you are on React 17, you may receive an error like `Can't resolve 'react/jsx-runtime'`.
You can resolve it by adding these aliases in your webpack config:

```javascript
config.resolve.alias = {
  ...config.resolve.alias,
  "react/jsx-dev-runtime": "react/jsx-dev-runtime.js",
  "react/jsx-runtime": "react/jsx-runtime.js",
};
```

## License

MIT - [javier-mora](https://github.com/javier-mora)

