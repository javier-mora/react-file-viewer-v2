import {
  PDFDocumentProxy,
  PDFPageProxy
} from 'pdfjs-dist/types/src/display/api'
import * as React from 'react'
import './styles.module.css'

interface IPDFPageProps {
  pdf: PDFDocumentProxy
  index: number
  zoom: number
  containerWidth: number
}

const DEFAULT_SCALE = 1.1

export const PDFPage = ({
  pdf,
  index,
  zoom,
  containerWidth
}: IPDFPageProps) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const [sizeContainer, setSizeContainer] = React.useState({
    width: 670,
    height: 870
  })

  const renderPage = (page: PDFPageProxy) => {
    const calculatedScale =
      containerWidth / page.getViewport({ scale: DEFAULT_SCALE }).width
    const scale =
      calculatedScale > DEFAULT_SCALE ? DEFAULT_SCALE : calculatedScale
    const viewport = page.getViewport({ scale: scale + zoom })
    const { width, height } = viewport

    const context = canvasRef.current?.getContext('2d')
    if (canvasRef.current) {
      canvasRef.current.width = width
      canvasRef.current.height = height
      setSizeContainer({ width: width, height: height })
    }

    if (context) {
      page.render({
        canvasContext: context,
        viewport
      })
    }
  }

  const fetchAndRenderPage = () => {
    pdf.getPage(index).then(renderPage)
  }

  React.useEffect(() => {
    fetchAndRenderPage()
  }, [zoom])

  return (
    <div
      key={`page-${index}`}
      style={{
        boxShadow: '0 3px 10px rgb(0 0 0 / 0.2)',
        marginBottom: 15,
        width: sizeContainer.width,
        height: sizeContainer.height
      }}
    >
      <canvas ref={canvasRef} width='670' height='870' />
    </div>
  )
}
