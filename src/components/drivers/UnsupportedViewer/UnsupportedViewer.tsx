import * as React from 'react'

interface IUnsupportedViewerProps {
  unsupportedComponent?: JSX.Element
  fileType: string
}

export const UnsupportedViewer = ({
  unsupportedComponent,
  fileType
}: IUnsupportedViewerProps) => {
  return (
    <div style={{ margin: 'auto', width: '100%', height: '100%' }}>
      <div
        style={{
          padding: '46px',
          background: 'white',
          margin: 'auto',
          textAlign: 'center'
        }}
      >
        {unsupportedComponent || (
          <p className='alert'>
            <b>{`.${fileType}`}</b> is not supported.
          </p>
        )}
      </div>
    </div>
  )
}
