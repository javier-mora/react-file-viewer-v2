import React from 'react'

import { FileViewer } from 'react-file-viewer-v2'

//import sampleHouse from './example_files/SampleHouse.wexbim'
//import solarImage from './example_files/02-USVI-Solar.jpg'
//import imag2 from './example_files/imag2.png'
//import docx from './example_files/SampleSpec.docx'
//import doc from './example_files/sample.doc'
//import csv from './example_files/Total_Crime.csv'
//import mp4 from './example_files/small.mp4'
//import xlsx from './example_files/SimpleSpreadsheet.xlsx'
//import photo360 from './example_files/360photo.jpg'
//import avi from './example_files/drop.avi'
//import webm from './example_files/small.webm'
//import mov from './example_files/step.mov'
//import mp3 from './example_files/sample.mp3'
//import rtf from './example_files/sample.rtf'
import pdf from './example_files/sample.pdf'

const CustomErorrMessage = (
  <div>Formato no compatible</div>
);

const App = () => {
  return <div style={{ width: 900, height: 700 }}>
    <FileViewer
      fileType="pdf"
      filePath={pdf}
      unsupportedComponent={CustomErorrMessage}
    />
  </div>
}

export default App
