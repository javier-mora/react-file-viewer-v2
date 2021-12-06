import * as React from 'react'
import { ReactComponent as ZoomIcon } from '../../../assets/zoom.svg'
import { ReactComponent as ZoomOutIcon } from '../../../assets/zoom-out.svg'

interface IPhotoViewerProps {
  filePath: string
  width: number | string
  height: number | string
}

const INCREASE_PERCENTAGE = 0.2

export const PhotoViewer = ({
  filePath,
  width = '100%',
  height = '100%'
}: IPhotoViewerProps) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const [zoom, setZoom] = React.useState(0)

  const reduceZoom = () => {
    if (zoom === 0) return
    setZoom((prev) => prev - 1)
  }

  const increaseZoom = () => {
    setZoom((prev) => prev + 1)
  }

  React.useEffect(() => {
    const context = canvasRef.current?.getContext('2d')
    if (canvasRef.current) {
      const image = new Image()
      image.src = filePath
      image.onload = () => {
        if (context) {
          // get the scale
          var scale = Math.min(500 / image.width, 500 / image.height)
          // get the top left position of the image
          const zoomScale = zoom * INCREASE_PERCENTAGE
          console.log(image.width, image.height, scale, zoomScale, zoom)
          var x = 510 / 2 - (image.width / 2) * scale
          var y = 510 / 2 - (image.height / 2) * scale

          if (canvasRef.current) {
            canvasRef.current.width =
              image.width * scale + image.width * zoomScale
            canvasRef.current.height =
              image.height * scale + image.height * zoomScale
          }

          context.drawImage(
            image,
            x,
            y,
            image.width * scale + image.width * zoomScale,
            image.height * scale + image.height * zoomScale
          )
        }
      }
    }
  }, [zoom])

  return (
    <div
      style={{
        margin: 'auto',
        width: width,
        height: height,
        overflow: 'auto'
      }}
    >
      <div className='view-control' onClick={increaseZoom}>
        <div
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
            bottom: '80px',
            right: '20px'
          }}
        >
          <ZoomIcon
            style={{
              width: 20,
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)'
            }}
          />
        </div>
      </div>
      <div className='view-control' onClick={reduceZoom}>
        <div
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
            right: '20px'
          }}
        >
          <ZoomOutIcon
            style={{
              width: 20,
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)'
            }}
          />
        </div>
      </div>
      <canvas ref={canvasRef} width='500' height='500' />
    </div>
  )
}
