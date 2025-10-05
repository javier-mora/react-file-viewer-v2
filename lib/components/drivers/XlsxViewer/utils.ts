/** -----------------------
 *  Helpers + Handlers
 * ----------------------*/
export function attachSelectionHandlers(sheetView: HTMLDivElement) {
    const root = sheetView.querySelector(".xl") as HTMLTableElement | null;
    if (!root) return () => { };

    let anchor: { row: number; col: number } | null = null;
    let draggingCells = false;
    let draggingRows = false;
    let draggingCols = false;
    let selectionRect: { r1: number; c1: number; r2: number; c2: number } | null = null;

    const getRC = (ref: string) => {
        const m = ref.match(/^([A-Z]+)(\d+)$/);
        if (!m) return null;
        const [, colLetters, rowStr] = m;
        let col = 0;
        for (let i = 0; i < colLetters.length; i++) {
            col = col * 26 + (colLetters.charCodeAt(i) - 64);
        }
        return { row: parseInt(rowStr, 10), col };
    };

    const rcToRef = (row: number, col: number) => {
        let s = "";
        let n = col;
        while (n > 0) {
            const m = (n - 1) % 26;
            s = String.fromCharCode(65 + m) + s;
            n = Math.floor((n - 1) / 26);
        }
        return `${s}${row}`;
    };

    const clearSel = () => {
        root.querySelectorAll("td.sel").forEach((el) => el.classList.remove("sel"));
        root
            .querySelectorAll("th.sel-h")
            .forEach((el) => el.classList.remove("sel-h"));
    };

    const applySel = (r1: number, c1: number, r2: number, c2: number) => {
        clearSel();
        const rStart = Math.min(r1, r2);
        const rEnd = Math.max(r1, r2);
        const cStart = Math.min(c1, c2);
        const cEnd = Math.max(c1, c2);
        selectionRect = { r1: rStart, c1: cStart, r2: rEnd, c2: cEnd };
        // cells
        for (let r = rStart; r <= rEnd; r++) {
            for (let c = cStart; c <= cEnd; c++) {
                const ref = rcToRef(r, c);
                const td = root.querySelector(`td[data-ref="${ref}"]`);
                if (td) td.classList.add("sel");
            }
        }
        // headers
        if (rStart === 1 && rEnd >= 1 && cStart <= cEnd) {
            // columnas
            for (let c = cStart; c <= cEnd; c++) {
                const th = root.querySelector(`thead th.xl-col[data-col="${c}"]`);
                if (th) th.classList.add("sel-h");
            }
        }
        if (cStart === 1 && cEnd >= 1 && rStart <= rEnd) {
            // filas
            for (let r = rStart; r <= rEnd; r++) {
                const th = root.querySelector(`tbody tr:nth-child(${r}) > th.xl-row`);
                if (th) th.classList.add("sel-h");
            }
        }
    };

    // --- Listeners ---
    const onMouseDownCells = (e: MouseEvent) => {
        const td = (e.target as HTMLElement).closest(
            "td[data-ref]"
        ) as HTMLTableCellElement | null;
        if (!td) return;
        const rc = getRC(td.dataset.ref || "");
        if (!rc) return;
        anchor = rc;
        draggingCells = true;
        applySel(anchor.row, anchor.col, anchor.row, anchor.col);
        // Ensure the container has focus so keydown (Ctrl/Cmd+C) works
        sheetView.focus();
        e.preventDefault();
    };

    const onMouseMove = (e: MouseEvent) => {
        if (!anchor) return;
        if (draggingCells) {
            const td = (e.target as HTMLElement).closest(
                "td[data-ref]"
            ) as HTMLTableCellElement | null;
            if (!td) return;
            const rc = getRC(td.dataset.ref || "");
            if (!rc) return;
            applySel(anchor.row, anchor.col, rc.row, rc.col);
        } else if (draggingRows) {
            const th = (e.target as HTMLElement).closest(
                "th.xl-row[data-row]"
            ) as HTMLTableCellElement | null;
            if (!th) return;
            const r = parseInt(th.dataset.row || "1", 10);
            const cols = root.querySelectorAll("thead th.xl-col").length;
            applySel(anchor.row, 1, r, cols);
        } else if (draggingCols) {
            const th = (e.target as HTMLElement).closest(
                "th.xl-col[data-col]"
            ) as HTMLTableCellElement | null;
            if (!th) return;
            const c = parseInt(th.dataset.col || "1", 10);
            const rows = root.querySelectorAll("tbody tr").length;
            applySel(1, anchor.col, rows, c);
        }
    };

    const onMouseUpDoc = () => {
        draggingCells = false;
        draggingRows = false;
        draggingCols = false;
        anchor = null;
    };

    const onMouseDownRowHeader = (e: MouseEvent) => {
        const th = (e.target as HTMLElement).closest(
            "th.xl-row[data-row]"
        ) as HTMLTableCellElement | null;
        if (!th) return;
        const r = parseInt(th.dataset.row || "1", 10);
        anchor = { row: r, col: 1 };
        draggingRows = true;
        const cols = root.querySelectorAll("thead th.xl-col").length;
        applySel(r, 1, r, cols);
        // Ensure the container has focus so keydown (Ctrl/Cmd+C) works
        sheetView.focus();
        e.preventDefault();
    };

    const onMouseDownColHeader = (e: MouseEvent) => {
        const th = (e.target as HTMLElement).closest(
            "th.xl-col[data-col]"
        ) as HTMLTableCellElement | null;
        if (!th) return;
        const c = parseInt(th.dataset.col || "1", 10);
        anchor = { row: 1, col: c };
        draggingCols = true;
        const rows = root.querySelectorAll("tbody tr").length;
        applySel(1, c, rows, c);
        // Ensure the container has focus so keydown (Ctrl/Cmd+C) works
        sheetView.focus();
        e.preventDefault();
    };

    const onKeyDownCopy = async (e: KeyboardEvent) => {
        if (!selectionRect) return;
        const isCopy = (e.key === "c" || e.key === "C") && (e.ctrlKey || e.metaKey);
        if (!isCopy) return;

        // Build TSV (text/plain)
        const rows: string[] = [];
        for (let r = selectionRect.r1; r <= selectionRect.r2; r++) {
            const cols: string[] = [];
            for (let c = selectionRect.c1; c <= selectionRect.c2; c++) {
                const ref = rcToRef(r, c);
                const td = root.querySelector(
                    `td[data-ref="${ref}"]`
                ) as HTMLElement | null;
                const val = td ? td.textContent || "" : "";
                cols.push(val.replace(/\t/g, " ").replace(/\r?\n/g, " "));
            }
            rows.push(cols.join("\t"));
        }
        const tsv = rows.join("\n");

        // Build HTML table (text/html) with inline styles and merged cells
        const esc = (s: string) => s
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");

        const skip = new Set<string>();
        let html = '<table style="border-collapse:collapse">';
        for (let r = selectionRect.r1; r <= selectionRect.r2; r++) {
            html += '<tr>';
            for (let c = selectionRect.c1; c <= selectionRect.c2; c++) {
                const k = `${r}:${c}`;
                if (skip.has(k)) continue;
                const ref = rcToRef(r, c);
                const td = root.querySelector(`td[data-ref="${ref}"]`) as HTMLElement | null;
                if (!td) {
                    html += '<td></td>';
                    continue;
                }
                const val = td.textContent || "";
                const style = td.getAttribute('style') || '';
                const rowspan = parseInt(td.getAttribute('rowspan') || '1', 10);
                const colspan = parseInt(td.getAttribute('colspan') || '1', 10);
                if (rowspan > 1 || colspan > 1) {
                    for (let rr = r; rr < r + rowspan; rr++) {
                        for (let cc = c; cc < c + colspan; cc++) {
                            if (rr === r && cc === c) continue;
                            skip.add(`${rr}:${cc}`);
                        }
                    }
                }
                const attrs = [
                    rowspan > 1 ? `rowspan="${rowspan}"` : '',
                    colspan > 1 ? `colspan="${colspan}"` : '',
                    style ? `style="${style}"` : ''
                ].filter(Boolean).join(' ');
                html += `<td ${attrs}>${esc(val).replace(/\r?\n/g, '<br/>')}</td>`;
            }
            html += '</tr>';
        }
        html += '</table>';

        // Try Clipboard API with HTML + plain text
        try {
            const winWithClipboardItem = window as unknown as { ClipboardItem?: new (items: Record<string, Blob>) => unknown };
            const ClipboardItemCtor = winWithClipboardItem.ClipboardItem;
            if (navigator.clipboard && 'write' in navigator.clipboard && ClipboardItemCtor) {
                const item = new ClipboardItemCtor({
                    'text/plain': new Blob([tsv], { type: 'text/plain' }),
                    'text/html': new Blob([html], { type: 'text/html' })
                });
                const clip = navigator.clipboard as unknown as { write: (items: unknown[]) => Promise<void> };
                await clip.write([item]);
            } else {
                // Fallback: use writeText (no HTML styles)
                const clipText = navigator.clipboard as unknown as { writeText?: (data: string) => Promise<void> };
                if (clipText && typeof clipText.writeText === 'function') {
                    await clipText.writeText(tsv);
                } else {
                    // No modern clipboard API available; cannot programmatically copy without deprecated execCommand.
                    // As a non-breaking fallback, select the content so the user can press Ctrl/Cmd+C.
                    const ta = document.createElement('textarea');
                    ta.value = tsv;
                    ta.style.position = 'fixed';
                    ta.style.left = '-9999px';
                    document.body.appendChild(ta);
                    ta.focus();
                    ta.select();
                }
            }
        } catch {
            // Last resort: try writeText, else noop selection
            const clipText = navigator.clipboard as unknown as { writeText?: (data: string) => Promise<void> };
            if (clipText && typeof clipText.writeText === 'function') {
                await clipText.writeText(tsv);
            } else {
                const ta = document.createElement('textarea');
                ta.value = tsv;
                ta.style.position = 'fixed';
                ta.style.left = '-9999px';
                document.body.appendChild(ta);
                ta.focus();
                ta.select();
            }
        }
        e.preventDefault();
    };

    // Adjuntar listeners
    root.addEventListener("mousedown", onMouseDownCells);
    root.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUpDoc);
    root.addEventListener("mousedown", onMouseDownRowHeader);
    root.addEventListener("mousedown", onMouseDownColHeader);
    // Importante: el keydown sobre el contenedor con foco
    sheetView.addEventListener("keydown", onKeyDownCopy);

    // Función de limpieza
    return () => {
        root.removeEventListener("mousedown", onMouseDownCells);
        root.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUpDoc);
        root.removeEventListener("mousedown", onMouseDownRowHeader);
        root.removeEventListener("mousedown", onMouseDownColHeader);
        sheetView.removeEventListener("keydown", onKeyDownCopy);
    };
}
