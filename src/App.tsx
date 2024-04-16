import React from 'react'
import { FileViewer } from '../'


function App() {
  const [file, setFile] = React.useState<File | undefined | null>(null);
  const [fileType, setFileType] = React.useState<string>('');

  return (
    <div>
      <input aria-label='file' type="file" onChange={(event) => {
          setFileType(event?.target?.files ? event?.target?.files[0]?.name.split('.')[1] : '');
          setFile(event?.target?.files ? event?.target?.files[0] : null);
        }}
      />
      <div style={{ height: '700px' }}>
        {file !== null && (<FileViewer 
            file={file!}
            fileType={fileType}
          />
        )}
      </div>
    </div>
  )
}

export default App
