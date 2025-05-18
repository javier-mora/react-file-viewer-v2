import { useEffect, useRef, useState } from "react";
import jspreadsheet from "jspreadsheet-ce";
import { getRangeDetails, WorkSheet, XlsxParser } from "xlsx-to-js";

import '../../../../node_modules/jspreadsheet-ce/dist/jspreadsheet.css';
import { calculateDisplaySize, createImageElement, createTextElement, insertElementInCell } from "./utils";

interface IXlsxViewerProps {
    fileBlob: Blob;
    width: number | string;
    height: number | string;
}

export const XlsxViewer = (props: IXlsxViewerProps) => {
    const jRef = useRef<HTMLDivElement>(null);
    const [selectedSheet, setSelectedSheet] = useState(0);
    const [gridData, setGridData] = useState<{worksheets: WorkSheet[], grid: string[][]}>({
        worksheets: [],
        grid: [],
    });
    const [isLoaded, setIsLoaded] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const getData = async () => {
            setIsLoading(true);
            const file = await props.fileBlob.arrayBuffer();
            const xlsxParser = new XlsxParser();
            const result = await xlsxParser.readFile(file, { dense: true, styles: true, drawings: true, skipHiddenRows: true });

            setGridData({
                worksheets: result.workSheets,
                grid: result.workSheets[selectedSheet].data.map(x => x.map(y => y.value)),
            });

            setIsLoaded(true);
        }
        getData();
    }, [props.fileBlob, selectedSheet]);

    useEffect(() => {
        const currentRef = jRef?.current;

        if (isLoaded) {
            if (currentRef && typeof currentRef === 'object') {
                if (gridData.worksheets.length > 0) {
                    // Tabla
                    const nroRows = gridData.worksheets[selectedSheet].data.length;
                    const nroCols = gridData.worksheets[selectedSheet].data.reduce((p, a) => a.length > p ? a.length : p, 0);
                    const maxDrawingWidth =gridData.worksheets[selectedSheet].drawings.reduce((p, a) => {
                        const s = calculateDisplaySize(a.position).width;
                        return s > p ? s : p;
                    }, 0);

                    jspreadsheet(currentRef, {
                        data: gridData.grid, 
                        minDimensions: [nroCols, nroRows],
                        onload: () => {
                            gridData.worksheets[selectedSheet].data.forEach((row, y) => {
                                row.forEach((col, x) => {
                                    const cellRef = (currentRef as jspreadsheet.JspreadsheetInstanceElement).jexcel.getCellFromCoords(x, y);
                                    
                                    if (col.style) {
                                        // Color de fuente
                                        if (col.style.fontColor) {
                                            cellRef.style.color = col.style.fontColor;
                                        }
                    
                                        // Color de fondo
                                        if (col.style.fgColor) {
                                            cellRef.style.backgroundColor = col.style.fgColor;
                                        }
                    
                                        // Bordes
                                        if (col.style.border) {
                                            if (col.style.border.left?.style) {
                                                cellRef.style.borderLeft = 'solid 1px #000000';
                                            }
                                            if (col.style.border.right?.style) {
                                                cellRef.style.borderRight = 'solid 1px #000000';
                                            }
                                            if (col.style.border.top?.style) {
                                                cellRef.style.borderTop = 'solid 1px #000000';
                                            }
                                            if (col.style.border.bottom?.style) {
                                                cellRef.style.borderBottom = 'solid 1px #000000';
                                            }
                                        }
                    
                                        // Negrita
                                        if (col.style.bold) {
                                            cellRef.style.fontWeight = 'bold';
                                        }
                    
                                        // Cursiva
                                        if (col.style.italic) {
                                            cellRef.style.fontStyle = 'italic';
                                        }
                    
                                        // Alineación vertical
                                        if (col.style.vAlign) {
                                            cellRef.style.verticalAlign = col.style.vAlign;
                                        }
                    
                                        // Alineación horizontal
                                        if (col.style.hAlign) {
                                            cellRef.style.textAlign = col.style.hAlign;
                                        }
                    
                                        // Ajuste de texto
                                        if (col.style.wrapText) {
                                            cellRef.style.whiteSpace = 'normal'; // Esto habilita el ajuste de texto
                                        }
                                    }
                                });
                            });

                            // Aplicar estilos de filas
                            gridData.worksheets[selectedSheet].rowStyles.forEach((row, i) => {
                                if (row.height) {
                                    (currentRef as jspreadsheet.JspreadsheetInstanceElement).jexcel.setHeight(i, row.height);
                                }
                            });

                            if (gridData.worksheets[selectedSheet].columnStyles.length === 0) {
                                // Ancho de columna
                                for(let i=0; i<nroCols; i++) {
                                    const defColWidth = gridData.worksheets[selectedSheet].defaultColWidth*8;
                                    if (i < nroCols - 1) {
                                        (currentRef as jspreadsheet.JspreadsheetInstanceElement).jexcel.setWidth(i, defColWidth);
                                    } else {
                                        (currentRef as jspreadsheet.JspreadsheetInstanceElement).jexcel.setWidth(i, defColWidth > maxDrawingWidth ? defColWidth : maxDrawingWidth);
                                    }
                                }
                            }
                            if (gridData.worksheets[selectedSheet].rowStyles.length === 0) {
                                // Ancho de filas
                                for(let i=0; i<nroRows; i++) {
                                    (currentRef as jspreadsheet.JspreadsheetInstanceElement).jexcel.setHeight(i, gridData.worksheets[selectedSheet].defaultRowHeight*8);
                                }
                            }

                            // Estilos de columnas
                            gridData.worksheets[selectedSheet].columnStyles.forEach(col => {
                                for(let i=col.min; i<=col.max ;i++) {
                                    if (i <= nroCols) {
                                        // Ancho de columna
                                        (currentRef as jspreadsheet.JspreadsheetInstanceElement).jexcel.setWidth(i-1, i < nroCols ? col.width*8 : maxDrawingWidth);
                                        // Si se debe ocultar
                                        if (col.collapsed || col.hidden) {
                                            (currentRef as jspreadsheet.JspreadsheetInstanceElement).jexcel.hideColumn(i-1);
                                        }
                                    }
                                }
                            });
                            
                            // Merged cells
                            gridData.worksheets[selectedSheet].mergeCells.forEach(r => {
                                const rDetail = getRangeDetails(r);
                                (currentRef as jspreadsheet.JspreadsheetInstanceElement).jexcel.setMerge(rDetail.origin, rDetail.colspan, rDetail.rowspan);
                            });

                            // Add drawings
                            gridData.worksheets[selectedSheet].drawings.forEach(r => {
                                switch(r.type) {
                                    case 'image':
                                        insertElementInCell(
                                            (currentRef as jspreadsheet.JspreadsheetInstanceElement), 
                                            r.position, 
                                            createImageElement(r.base64, calculateDisplaySize(r.position))
                                        );
                                        break;
                                    case 'textbox':
                                        insertElementInCell(
                                            (currentRef as jspreadsheet.JspreadsheetInstanceElement), 
                                            r.position, 
                                            createTextElement(r.properties?.['text'] ?? '', r.properties?.['size'] ?? 12, {})
                                        );
                                        break;
                                    /*case 'shape':
                                        insertElementInCell(
                                            (currentRef as jspreadsheet.JspreadsheetInstanceElement), 
                                            r.position, 
                                            createShapeElement(r.properties?.['size'] ?? 12, {})
                                        );
                                        break;*/
                                }
                            });

                            setIsLoading(false);
                        },
                    });
                }
            }
        }

        // Función para limpiar completamente jspreadsheet y sus listeners
        return () => {
            if (currentRef && (currentRef as jspreadsheet.JspreadsheetInstanceElement).jexcel) {
                (currentRef as jspreadsheet.JspreadsheetInstanceElement).jexcel.destroy();

                // Elimina todos los hijos del nodo para limpiar el DOM
                while (currentRef.firstChild) {
                    currentRef.removeChild(currentRef.firstChild);
                }
            }
        };
        
    }, [gridData, isLoaded, selectedSheet]);

    return (
        <div style={{ height: '100%' }}>
            {isLoading && (
                <div>
                    loading...
                </div>
            )}
            <div style={isLoading ? { display: 'none' } : { display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ flex: '1', overflowY: 'auto', backgroundColor: 'lightgray' }}>
                    <div id="pg-xlsx-viewer-v1" ref={jRef}/>
                </div>
                <div style={{ backgroundColor: '#262626', padding: '5px', height: '36px', display: 'flex' }}>
                    {gridData.worksheets.map((x, i) => (
                        <button 
                            key={`btn-sheet-${i}`} 
                            type='button' 
                            onClick={() => {
                                setIsLoading(true);
                                setSelectedSheet(i);
                            }}
                            style={{ borderRadius: '8px', color: '#ffffff', backgroundColor: '#8a8a8a', borderWidth: '0', marginLeft: '5px' }}
                        >
                            {x.name}
                        </button>
                    ))}
                </div>
                
            </div>
        </div>
    );
};