import * as React from 'react'
import {
  PhotoViewer,
  PDFViewer,
  DocxViewer,
  AudioViewer,
  VideoViewer,
  UnsupportedViewer
} from './components/drivers'

interface IFileViewer {
  fileType: string
  filePath: string
  unsupportedComponent?: JSX.Element
}

export const FileViewer = ({
  fileType,
  filePath,
  unsupportedComponent
}: IFileViewer) => {
  const [loading, setLoading] = React.useState(true)
  const [measure, setMeasure] = React.useState({
    height: 0,
    width: 0
  })

  React.useLayoutEffect(() => {
    const container = document.getElementById('pg-viewer')
    const height = container ? container.clientHeight : 0
    const width = container ? container.clientWidth : 0
    setMeasure({ height: height, width: width })
    setLoading(false)
  }, [])

  const Driver = React.useMemo(() => {
    switch (fileType) {
      case 'jpg':
      case 'jpeg':
      case 'gif':
      case 'bmp':
      case 'png': {
        return PhotoViewer
      }
      case 'pdf': {
        return PDFViewer
      }
      case 'docx': {
        return DocxViewer
      }
      case 'mp3': {
        return AudioViewer
      }
      case 'webm':
      case 'mp4': {
        return VideoViewer
      }
      default: {
        return UnsupportedViewer
      }
    }
  }, [fileType, measure.height, measure.width])

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'row' }}>
      <div
        id='pg-viewer'
        style={{ height: '100%', position: 'relative', flexGrow: 2 }}
      >
        {!loading && (
          <Driver
            filePath={filePath}
            fileType={fileType}
            width={measure.width}
            height={measure.height}
            unsupportedComponent={unsupportedComponent}
          />
        )}
      </div>
    </div>
  )
}
