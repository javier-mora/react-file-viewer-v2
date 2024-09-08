import React, { useEffect } from "react";
import * as XLSX from 'xlsx';
import CanvasDatagrid from 'canvas-datagrid';
import { Loading } from "../../ui";

interface IXlsxViewerProps {
    fileBlob: Blob;
    width: number | string;
    height: number | string;
}

function colName(n: number) {
    const ordA = 'a'.charCodeAt(0);
    const ordZ = 'z'.charCodeAt(0);
    const len = ordZ - ordA + 1;
    let s = '';

    while (n >= 0) {
        s = String.fromCharCode((n % len) + ordA) + s;
        n = Math.floor(n / len) - 1;
    }

    return s;
}

function adjustArrays(array: unknown[][], n: number, defaultValue: unknown) { 
    for (let i = 0; i < array.length; i++) {
        const subarray = array[i];
        while (subarray.length < n) {
            subarray.push(defaultValue);
        }
    }
}

function getArray(obj: XLSX.CellObject[][] | undefined) {
    const arr: { value: string; bg: string; }[][] = [];
    if (obj !== undefined && obj !== null) {
        for (let y = 0; y < obj.length; y++) {
            const row: { value: string; bg: string; }[] = [];
            if (obj[y] !== undefined && obj[y] !== null) {
                for (let x = 0; x < obj[y].length; x++) {
                    if (obj[y][x] !== undefined && obj[y][x] !== null) {
                        row.push({
                            value: obj[y][x].w ?? '',
                            bg: obj[y][x].s?.fgColor?.rgb ?? 'ffffff',
                        });
                    } else {
                        row.push({ value: '', bg: 'ffffff' });
                    }
                }
            }
            arr.push(row);
        }
    }
    const colCount = arr.reduce((arrPrev, arrAct) => {
        return arrAct.length > arrPrev.length ? arrAct : arrPrev;
      }, []).length;
    
    adjustArrays(arr, colCount, { value: '', bg: 'ffffff' });

    return arr;
}

export const XlsxViewer = (props: IXlsxViewerProps) => {
    const [isLoading, setIsLoading] = React.useState(true);  
    const [gridData, setGridData] = React.useState<unknown[]>([]);
    const targetNode = React.createRef<HTMLDivElement>();

    useEffect(() => {
        const getData = async () => {
            const file = await props.fileBlob.arrayBuffer();
            const workbook = XLSX.read(file, { cellStyles: true, dense: true });
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const json = getArray(worksheet["!data"])

            const data = [];
            for (let x = 0; x < json.length; x++) {
                const row: Record<string, unknown> = {};
            
                for (let y = 0; y < json[x].length; y++) {
                    const n = colName(y).toUpperCase();
                    row[n] = json[x][y].value;
                }
            
                data.push(row);
            }
            setGridData(data);
            setIsLoading(false);
        }
        getData();
    }, [props.fileBlob]);

    useEffect(() => {
        if (gridData.length > 0) {
            if (targetNode.current) targetNode.current.innerHTML = "";
            const grid = CanvasDatagrid({ 
                parentNode: targetNode.current,
                data: gridData,
                allowColumnReordering: false,
                allowSorting: false,
                showClearSettingsOption: false,
                showColumnSelector: false,
                showFilter: false,
                showOrderByOption: false,
            });
            grid.style.columnHeaderCellHorizontalAlignment = 'center';
        }
    }, [gridData, targetNode]);

    return (
        <div>
            {isLoading && (
                <div>
                    <Loading/>
                </div>
            )}
            {!isLoading && (
                <div id="pg-xlsx-viewer-v1" ref={targetNode}/>
            )}
        </div>
    );
};