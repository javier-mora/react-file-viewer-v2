import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist/legacy/build/pdf'
import pdfjsWorker from 'pdfjs-dist/legacy/build/pdf.worker.entry'
import * as React from 'react'
import VisualWindow from 'react-visual-window'
import { PDFPage } from './PDFPage'

interface IPDFViewerProps {
  filePath: string
  width: number
  height: number
}

const INCREASE_PERCENTAGE = 0.2
GlobalWorkerOptions.workerSrc = pdfjsWorker

export const PDFViewer = ({ filePath, width, height }: IPDFViewerProps) => {
  const container = React.useRef<HTMLDivElement>(null)
  const [zoom, setZoom] = React.useState(0)
  const [pdf, setPdf] = React.useState<any>(null)
  const [containerWidth, setContainerWidth] = React.useState(0)

  const reduceZoom = () => {
    if (zoom === 0) return
    setZoom((prev) => prev - 1)
  }

  const increaseZoom = () => {
    setZoom((prev) => prev + 1)
  }

  const resetZoom = () => {
    setZoom(0)
  }

  React.useLayoutEffect(() => {
    const rContainerWidth = container.current?.offsetWidth || 0
    getDocument(filePath).promise.then((pdf) => {
      setContainerWidth(rContainerWidth)
      setPdf(pdf)
    })
  }, [filePath])

  const renderLoading = () => {
    return <div className='pdf-loading'>LOADING...</div>
  }

  const pagesData = React.useMemo(() => {
    if (pdf) {
      return Array.apply(null, { length: pdf.numPages })
    } else {
      return []
    }
  }, [pdf])

  const Row = React.forwardRef<HTMLDivElement, { index: number }>(
    (props, ref) => {
      const { index } = props
      console.log(index)
      return (
        <div ref={ref} key={index + 1}>
          <PDFPage
            index={index + 1}
            pdf={pdf}
            containerWidth={containerWidth}
            zoom={zoom * INCREASE_PERCENTAGE}
          />
        </div>
      )
    }
  )

  return (
    <div style={{ margin: 'auto', width: '100%', height: '100%', padding: 5 }}>
      <div className='pdf-controlls-container'>
        <div className='view-control' onClick={increaseZoom}>
          <a
            style={{
              cursor: 'default',
              width: '30px',
              height: '30px',
              background: '#FFF',
              border: '1px solid #005bac',
              borderRadius: '50%',
              color: '#005bac',
              padding: '5px 5px 5px',
              position: 'absolute',
              textAlign: 'center',
              transition: 'all 0.3s ease',
              zIndex: 1,
              bottom: '90px',
              right: '20px',
              fontSize: '20px',
              fontWeight: 'bold'
            }}
          >
            +
          </a>
        </div>
        <div className='view-control' onClick={resetZoom}>
          <i className='zoom-reset' />
        </div>
        <div className='view-control' onClick={reduceZoom}>
          <a
            style={{
              cursor: 'default',
              width: '30px',
              height: '30px',
              background: '#FFF',
              border: '1px solid #005bac',
              borderRadius: '50%',
              color: '#005bac',
              padding: '5px 5px 5px',
              position: 'absolute',
              textAlign: 'center',
              transition: 'all 0.3s ease',
              zIndex: 1,
              bottom: '30px',
              right: '20px',
              fontSize: '20px',
              fontWeight: 'bold'
            }}
          >
            -
          </a>
        </div>
      </div>
      <div
        ref={container}
        style={{
          width: width,
          height: height,
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          paddingLeft: 10
        }}
      >
        {!pdf && renderLoading()}
        {pdf && (
          <VisualWindow defaultItemHeight={18} itemData={pagesData}>
            {Row}
          </VisualWindow>
        )}
      </div>
    </div>
  )
}
