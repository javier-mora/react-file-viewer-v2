# react-file-viewer-v2

> Extendable file viewer for web

[![NPM](https://img.shields.io/npm/v/react-file-viewer-v2.svg)](https://www.npmjs.com/package/react-file-viewer-v2) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

**react-file-viewer-v2** is a small package for viewing files on the web inspired by [react-file-viewer](https://github.com/plangrid/react-file-viewer)

## Install

```bash
npm install --save react-file-viewer-v2
```

## Supported file formats:

 - Images: png, jpeg, gif
 - pdf
 - docx
 - xlsx
 - Video: mp4, webm
 - Audio: mp3
## Usage
There is one main React component, `FileViewer`, that takes the following props:

`fileType` string: type of resource to be shown (one of the supported file
formats, eg `'png'`). Passing in an unsupported file type will result in displaying
an `unsupported file type` message (or a custom component).

`file` blob: Blob of the resource to be shown by the FileViewer.

`unsupportedComponent` react element [optional]: A component to render in case
the file format is not supported.

```tsx
import React, { Component } from 'react'

import { FileViewer } from 'react-file-viewer-v2'

class Example extends Component {
  render() {
    return <FileViewer
      file={pdf}
      fileType="pdf"
    />
  }
}
```

### Problems with react 17
If you are on React v17, you may receive an error like below: `Module not found: Error: Can't resolve 'react/jsx-runtime' in '\node_modules\react-file-viewer-v2\dist\components\FileViewer' Did you mean 'jsx-runtime.js'?` You can resolve this by modifying your webpack config as below:

```javascript
config.resolve.alias= {
  ...config.resolve.alias,
  "react/jsx-dev-runtime": "react/jsx-dev-runtime.js",
  "react/jsx-runtime": "react/jsx-runtime.js"
}
```

## License

MIT © [javier-mora](https://github.com/javier-mora)
