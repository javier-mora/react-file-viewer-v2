/**
 * Default CSS definition for typescript,
 * will be overridden with file-specific definitions by rollup
 */

declare module '*.module.css' {
  const classes: { [key: string]: string }
  export default classes
}

declare module '*.module.scss' {
  const classes: { readonly [key: string]: string }
  export default classes
}

interface SvgrComponent
  extends React.StatelessComponent<React.SVGAttributes<SVGElement>> {}

declare module '*.svg' {
  const svgUrl: string
  const svgComponent: SvgrComponent
  export default svgUrl
  export { svgComponent as ReactComponent }
}

declare module 'pdfjs-dist/legacy/build/pdf.worker.entry'

declare module '*.png' {
  const value: any
  export = value
}
