# react-file-viewer-v2

> Extendable file viewer for web

[![NPM](https://img.shields.io/npm/v/react-file-viewer-v2.svg)](https://www.npmjs.com/package/react-file-viewer-v2) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save react-file-viewer-v2
```

## Usage

```tsx
import React, { Component } from 'react'

import { FileViewer } from 'react-file-viewer-v2'

class Example extends Component {
  render() {
    return <FileViewer
      fileType="pdf"
      filePath={pdf}
    />
  }
}
```

## License

MIT © [javier-mora](https://github.com/javier-mora)
