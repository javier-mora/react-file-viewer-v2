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
  omit?: string[];
}

export const FileViewer = ({
  file,
  fileType,
  unsupportedComponent,
  omit,
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

  const Driver = (props: { fileType: string, filePath: string, fileBlob: Blob, width: number | string, height: number | string, omit: string[] }) => {
    switch (fileType) {
      case 'jpg':
      case 'gif':
      case 'bmp':
      case 'png': {
        if (props.omit.includes('jpg') || props.omit.includes('gif') || props.omit.includes('bmp') || props.omit.includes('png')) {
          return unsupportedComponent ?? <UnsupportedViewer />
        } else {
          return <PhotoViewer {...props} />
        }
      }
      case 'pdf': {
        if (props.omit.includes('pdf')) {
          return unsupportedComponent ?? <UnsupportedViewer />
        } else {
          return <PdfViewer {...props} />
        }
      }
      case 'docx': {
        if (props.omit.includes('docx')) {
          return unsupportedComponent ?? <UnsupportedViewer />
        } else {
          return <DocxViewer {...props} /> 
        }
      }
      case 'xlsx': {
        if (props.omit.includes('xlsx')) {
          return unsupportedComponent ?? <UnsupportedViewer />
        } else {
          return <XlsxViewer {...props} />  
        }
      }
      case 'webm':
      case 'mp4': {
        if (props.omit.includes('webm') || props.omit.includes('mp4')) {
          return unsupportedComponent ?? <UnsupportedViewer />
        } else {
          return <VideoViewer {...props} /> 
        }
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
            omit={omit ?? []}
          />
        )}
      </div>
    </div>
  )
}