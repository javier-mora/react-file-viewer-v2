import * as React from 'react';
import {
  PhotoViewer,
  PdfViewer,
  DocxViewer,
  XlsxViewer,
  VideoViewer,
  UnsupportedViewer,
  PptxViewer,
  CsvViewer
} from '../drivers';
import styles from './styles.module.css'
import { Error, Loading } from '../ui';

export type FileViewerTheme = 'auto' | 'light' | 'dark';

interface IFileViewer {
  file: Blob;
  fileType: string;
  unsupportedComponent?: React.ReactElement;
  omit?: string[];
  theme?: FileViewerTheme;
  csvDelimiter?: 'auto' | ',' | ';' | '\t' | string;
}

interface IFileViewerDriver {
  fileType: string;
  filePath: string;
  fileBlob: Blob;
  width: number | string;
  height: number | string;
  omit: string[];
  theme: FileViewerTheme;
  csvDelimiter: 'auto' | ',' | ';' | '\t' | string;
  unsupportedComponent?: React.ReactElement;
}

const FileViewerDriver = (props: IFileViewerDriver) => {
  const unsupported = () => props.unsupportedComponent ?? <UnsupportedViewer />;

  switch (props.fileType) {
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'bmp':
    case 'png':
      return props.omit.includes(props.fileType) ? unsupported() : <PhotoViewer {...props} />;
    case 'pdf':
      return props.omit.includes('pdf') ? unsupported() : <PdfViewer {...props} />;
    case 'docx':
      return props.omit.includes('docx') ? unsupported() : <DocxViewer {...props} />;
    case 'xlsx':
      return props.omit.includes('xlsx') ? unsupported() : <XlsxViewer {...props} />;
    case 'csv':
    case 'tsv':
      return props.omit.includes(props.fileType) ? unsupported() : <CsvViewer {...props} />;
    case 'webm':
    case 'mp4':
      return props.omit.includes(props.fileType) ? unsupported() : <VideoViewer {...props} />;
    case 'pptx':
      return props.omit.includes('pptx') ? unsupported() : <PptxViewer {...props} />;
    default:
      return unsupported();
  }
};

export const FileViewer = ({
  file,
  fileType,
  unsupportedComponent,
  omit,
  theme = 'auto',
  csvDelimiter = 'auto',
}: IFileViewer) => {
  const viewerRef = React.useRef<HTMLDivElement | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [dataUri, setDataUri] = React.useState<string>('');
  const [measure, setMeasure] = React.useState({
    height: 0,
    width: 0
  })

  React.useLayoutEffect(() => {
    const container = viewerRef.current;
    if (!container) return;

    const updateMeasure = () => {
      const { clientHeight: height, clientWidth: width } = container;
      setMeasure((current) => (
        current.height === height && current.width === width
          ? current
          : { height, width }
      ));
    };
    updateMeasure();

    const observer = new ResizeObserver(updateMeasure);
    observer.observe(container);
    return () => observer.disconnect();

  }, []);

  React.useEffect(() => {
    setIsLoading(true);
    const url = URL.createObjectURL(file);
    setDataUri(url);
    setIsLoading(false);
    return () => {
      try {
        URL.revokeObjectURL(url);
      } catch (err) {
        console.warn('react-file-viewer-v2: failed to revokeObjectURL', err);
      }
    };
  }, [file]);

  const normalizedFileType = fileType.trim().toLowerCase().replace(/^\./, '');

  return (
    <div className={styles.pgContainer}>
      <div ref={viewerRef} className={styles.pgViewer}>
        {isLoading && (
          <Loading/>
        )}
        {!isLoading && dataUri === '' && (
          <Error msg='Error al visualizar archivo'/>
        )}
        {!isLoading && dataUri !== '' && (
          <FileViewerDriver
            filePath={dataUri}
            fileBlob={file}
            fileType={normalizedFileType}
            width={measure.width}
            height={measure.height}
            omit={omit ?? []}
            theme={theme}
            csvDelimiter={csvDelimiter}
            unsupportedComponent={unsupportedComponent}
          />
        )}
      </div>
    </div>
  )
}
