import * as React from 'react'
import Loading from '../../Loading/Loading'
import styles from './styles.module.css'

interface IAudioViewerProps {
  filePath: string
}

export const AudioViewer = ({ filePath }: IAudioViewerProps) => {
  const [isLoading, setIsLoading] = React.useState(true)

  const onCanPlay = () => {
    setIsLoading(false)
  }

  return (
    <div className={styles.videoContainer}>
      {isLoading && <Loading />}
      <audio
        style={{ visibility: isLoading ? 'hidden' : 'visible' }}
        controls
        onCanPlay={() => onCanPlay()}
        src={filePath}
      >
        Video playback is not supported by your browser.
      </audio>
    </div>
  )
}
