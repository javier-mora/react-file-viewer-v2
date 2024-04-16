import * as React from 'react';
import {
  PhotoViewer,
  PdfViewer,
  DocxViewer,
  XlsxViewer,
  VideoViewer,
  UnsupportedViewer
} from '../drivers';
import styles from './styles.module.css'
import { Error, Loading } from '../ui';

interface IFileViewer {
  file: Blob;
  fileType: string;
  unsupportedComponent?: JSX.Element;
}

export const FileViewer = ({
  file,
  fileType,
  unsupportedComponent
}: IFileViewer) => {
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [dataUri, setDataUri] = React.useState<string>('');
  const [measure, setMeasure] = React.useState({
    height: 0,
    width: 0
  })

  React.useLayoutEffect(() => {
    const container = document.getElementById('pg-viewer')
    const height = container ? container.clientHeight : 0
    const width = container ? container.clientWidth : 0
    setMeasure({ height: height, width: width })

  }, []);

  React.useEffect(() => {
    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      if (!(event?.target?.result instanceof ArrayBuffer)) {
        setDataUri(event?.target?.result ?? '');
      }
      setIsLoading(false);
    };
    reader.readAsDataURL(file);
  }, [file]);

  const Driver = (props: { fileType: string, filePath: string, fileBlob: Blob, width: number | string, height: number | string }) => {
    switch (fileType) {
      case 'jpg':
      case 'gif':
      case 'bmp':
      case 'png': {
        return <PhotoViewer {...props} />
      }
      case 'pdf': {
        return <PdfViewer {...props} />
      }
      case 'docx': {
        return <DocxViewer {...props} />
      }
      case 'xlsx': {
        return <XlsxViewer {...props} />
      }
      case 'webm':
      case 'mp4': {
        return <VideoViewer {...props} />
      }
      case 'pptx':
      default: {
        return unsupportedComponent ?? <UnsupportedViewer />
      }
    }
  }

  return (
    <div className={styles.pgContainer}>
      <div id="pg-viewer" className={styles.pgViewer}>
        {isLoading && (
          <Loading/>
        )}
        {!isLoading && dataUri === '' && (
          <Error msg='Error al visualizar archivo'/>
        )}
        {!isLoading && dataUri !== '' && (
          <Driver
            filePath={dataUri}
            fileBlob={file}
            fileType={fileType}
            width={measure.width}
            height={measure.height}
          />
        )}
      </div>
    </div>
  )
}