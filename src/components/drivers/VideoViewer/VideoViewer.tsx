import * as React from 'react'
import Loading from '../../Loading/Loading'
import styles from './styles.module.css'

interface IVideoViewerProps {
  filePath: string
  fileType: string
}

export const VideoViewer = ({ filePath, fileType }: IVideoViewerProps) => {
  const [isLoading, setIsLoading] = React.useState(true)

  const onCanPlay = () => {
    setIsLoading(false)
  }

  const renderLoading = () => {
    if (isLoading) {
      return <Loading />
    }
    return null
  }

  return (
    <div className='pg-driver-view'>
      <div className={styles.videoContainer}>
        {renderLoading()}
        <video
          style={{ visibility: isLoading ? 'hidden' : 'visible' }}
          controls
          itemType={`video/${fileType}`}
          onCanPlay={() => onCanPlay()}
          src={filePath}
        >
          Video playback is not supported by your browser.
        </video>
      </div>
    </div>
  )
}
