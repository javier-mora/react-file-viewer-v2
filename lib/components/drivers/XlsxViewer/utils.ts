interface DrawingPosition {
    from: { col: number; colOff: number; row: number; rowOff: number };
    to: { col: number; colOff: number; row: number; rowOff: number };
}

export function calculateDisplaySize(
    position: DrawingPosition,
    getColWidthPx: (col: number) => number = () => 64,
    getRowHeightPx: (row: number) => number = () => 20
): { width: number; height: number, pt: number, pl: number } {
    const EMU_TO_PX = 1 / 9525;

    let width = 0;
    for (let col = position.from.col; col < position.to.col; col++) {
        width += getColWidthPx(col);
    }
    width += (position.to.colOff - position.from.colOff) * EMU_TO_PX;

    let height = 0;
    for (let row = position.from.row; row < position.to.row; row++) {
        height += getRowHeightPx(row);
    }
    height += (position.to.rowOff - position.from.rowOff) * EMU_TO_PX;

    const pt = position.from.rowOff * EMU_TO_PX;
    const pl = position.from.colOff * EMU_TO_PX;

    return { width, height, pt, pl };
}

export function insertElementInCell(
    spreadsheet: jspreadsheet.JspreadsheetInstanceElement,
    position: DrawingPosition,
    content: HTMLElement
) {
    const { from } = position;
    const cellElement = spreadsheet.jexcel.getCellFromCoords(from.col, from.row);

    if (cellElement) {
        cellElement.style.overflow = 'visible';
        cellElement.style.position = 'relative';
        
        let container = cellElement.querySelector('.cell-drawing-container') as HTMLElement;
        
        if (!container) {
            container = document.createElement('div');
            container.className = 'cell-drawing-container';
            container.style.position = 'absolute';
            container.style.display = 'flex';
            container.style.top = '1px';
            container.style.left = '1px';
            //container.style.width = '100%';
            //container.style.height = '100%';
            container.style.overflow = 'hidden';
            cellElement.innerHTML = '';
            cellElement.appendChild(container);
        }

        container.appendChild(content);
    }
}


export function createImageElement(base64: string, size: { width: number; height: number, pt: number, pl: number }): HTMLElement {
    const img = document.createElement('img');
    img.src = `data:image/png;base64,${base64}`;
    img.style.position = 'relative';
    img.style.width = `${size.width}px`;
    img.style.height = `${size.height}px`;
    img.style.objectFit = 'contain';
    img.style.paddingLeft = `${size.pl}px`;
    img.style.paddingLeft = `${size.pl}px`;
    return img;
}

export function createShapeElement(size: { width: number; height: number, pt: number, pl: number }, options: Record<string, string>): HTMLElement {
    const div = document.createElement('div');
    div.style.position = 'relative';
    div.style.width = `${size.width}px`;
    div.style.height = `${size.height}px`;
    div.style.backgroundColor = options.fillColor || '#cccccc';
    div.style.border = `1px solid ${options.borderColor || '#000'}`;
    if (options.shapeType === 'ellipse') {
        div.style.borderRadius = '50%';
    }
    div.style.paddingLeft = `${size.pl}px`;
    div.style.paddingLeft = `${size.pl}px`;
    return div;
}

export function createTextElement(text: string, size: { width: number; height: number, pt: number, pl: number }, options: Record<string, string>): HTMLElement {
    const div = document.createElement('div');
    div.style.position = 'relative';
    div.style.width = `${size.width}px`;
    div.style.height = `${size.height}px`;
    div.style.display = 'flex';
    div.style.alignItems = 'center';
    div.style.justifyContent = 'center';
    div.style.fontSize = `${options.fontSize || 14}px`;
    div.style.color = options.fontColor || '#000';
    div.style.backgroundColor = options.backgroundColor || 'transparent';
    div.innerText = text;
    div.style.paddingLeft = `${size.pl}px`;
    div.style.paddingLeft = `${size.pl}px`;
    return div;
}