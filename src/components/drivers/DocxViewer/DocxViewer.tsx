import * as React from 'react'
import mammoth from 'mammoth'
import Loading from '../../Loading/Loading'

interface IDocxViewerProps {
  filePath: string
}

export const DocxViewer = ({ filePath }: IDocxViewerProps) => {
  React.useEffect(() => {
    const jsonFile = new XMLHttpRequest()
    jsonFile.open('GET', filePath, true)
    jsonFile.send()
    jsonFile.responseType = 'arraybuffer'
    jsonFile.onreadystatechange = () => {
      if (jsonFile.readyState === 4 && jsonFile.status === 200) {
        mammoth
          .convertToHtml(
            { arrayBuffer: jsonFile.response },
            { includeDefaultStyleMap: true }
          )
          .then((result) => {
            console.log(result)
            const docEl = document.createElement('div')
            docEl.innerHTML = result.value
            const doc = document.getElementById('docx')
            if (doc) doc.innerHTML = docEl.outerHTML
          })
          .catch((a: any) => {
            console.log('alexei: something went wrong', a)
          })
      }
    }
  }, [])

  return (
    <div
      style={{ overflow: 'auto', padding: 10, width: '100%', height: '100%' }}
    >
      <div
        style={{
          padding: '40px',
          background: 'white',
          boxShadow: '0 3px 10px rgb(0 0 0 / 0.2)'
        }}
      >
        <div id='docx' style={{ width: '100%', height: '100%' }}>
          <Loading />
        </div>
      </div>
    </div>
  )
}
