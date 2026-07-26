import { useCallback, useEffect, useRef, useState } from "react";
import { attachSelectionHandlers } from "../XlsxViewer/utils";
import { Error } from "../../ui";

import styles from "../XlsxViewer/styles.module.css";

type CsvDelimiter = "auto" | "," | ";" | "\t" | string;

interface ICsvViewerProps {
    fileBlob: Blob;
    fileType: string;
    csvDelimiter?: CsvDelimiter;
    theme?: "auto" | "light" | "dark";
}

interface ParsedCsv {
    rows: string[][];
    delimiter: string;
}

const delimiterCandidates = [",", ";", "\t", "|"];
const CSV_PAGE_SIZE = 500;

const spreadsheetStyles = `
<style>
.xlwb { font-family: Arial, sans-serif; color: #222; }
.xl-sheet { margin: 12px 0; }
.xl { border-collapse: collapse; table-layout: fixed; border: 1px solid #d0d7de; }
.xl thead th { position: sticky; top: 0; background: #f6f8fa; z-index: 1; }
.xl th.xl-row { position: sticky; left: 0; background: #f6f8fa; z-index: 1; }
.xl th, .xl td { border: 1px solid #d0d7de; padding: 4px 6px; white-space: pre; box-sizing: border-box; }
.xl td, .xl th { overflow: visible; }
.xl th { text-align: center; font-weight: 600; font-size: 12px; color: #57606a; }
.xl td { background: #fff; font-size: 13px; }
.xl .xl-corner { background: #f6f8fa; width: 36px; min-width: 36px; }
.xl .xl-col { width: 96px; min-width: 64px; }
.xl th.xl-row { width: 36px; min-width: 36px; }
.xl-wrap { position: relative; display: inline-block; }
</style>`;

function getColumnName(index: number) {
    let name = "";
    let value = index;
    while (value > 0) {
        const remainder = (value - 1) % 26;
        name = String.fromCharCode(65 + remainder) + name;
        value = Math.floor((value - 1) / 26);
    }
    return name;
}

function escapeHtml(value: string) {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function normalizeDelimiter(delimiter: CsvDelimiter | undefined, fileType: string) {
    if (delimiter && delimiter !== "auto") return delimiter;
    if (fileType === "tsv") return "\t";
    return "auto";
}

function parseDelimitedText(text: string, delimiter: string) {
    const rows: string[][] = [];
    let row: string[] = [];
    let value = "";
    let inQuotes = false;

    for (let index = 0; index < text.length; index += 1) {
        const char = text[index];
        const nextChar = text[index + 1];

        if (char === '"') {
            if (inQuotes && nextChar === '"') {
                value += '"';
                index += 1;
            } else {
                inQuotes = !inQuotes;
            }
            continue;
        }

        if (!inQuotes && char === delimiter) {
            row.push(value);
            value = "";
            continue;
        }

        if (!inQuotes && (char === "\n" || char === "\r")) {
            row.push(value);
            rows.push(row);
            row = [];
            value = "";
            if (char === "\r" && nextChar === "\n") index += 1;
            continue;
        }

        value += char;
    }

    row.push(value);
    rows.push(row);

    return rows.filter((currentRow, rowIndex) => {
        if (rowIndex < rows.length - 1) return true;
        return currentRow.some((cell) => cell.length > 0);
    });
}

function scoreRows(rows: string[][]) {
    const populatedRows = rows.slice(0, 25).filter((row) => row.some((cell) => cell.trim() !== ""));
    if (populatedRows.length === 0) return 0;

    const widths = populatedRows.map((row) => row.length);
    const multiColumnRows = widths.filter((width) => width > 1).length;
    const widthCounts = new Map<number, number>();
    widths.forEach((width) => {
        widthCounts.set(width, (widthCounts.get(width) ?? 0) + 1);
    });

    const consistency = Math.max(...Array.from(widthCounts.values()));
    const averageWidth = widths.reduce((sum, width) => sum + width, 0) / widths.length;

    return multiColumnRows * 10 + consistency * 3 + averageWidth;
}

function parseCsv(text: string, delimiter: CsvDelimiter | undefined, fileType: string): ParsedCsv {
    const normalizedDelimiter = normalizeDelimiter(delimiter, fileType);

    if (normalizedDelimiter !== "auto") {
        return {
            rows: parseDelimitedText(text, normalizedDelimiter),
            delimiter: normalizedDelimiter,
        };
    }

    const [best] = delimiterCandidates
        .map((candidate) => {
            const rows = parseDelimitedText(text, candidate);
            return { delimiter: candidate, rows, score: scoreRows(rows) };
        })
        .sort((left, right) => right.score - left.score);

    return {
        rows: best.rows,
        delimiter: best.delimiter,
    };
}

function renderSheetHtml(rows: string[][], startRow = 0) {
    const columnCount = Math.max(1, ...rows.map((row) => row.length));
    const normalizedRows = rows.length > 0 ? rows : [[""]];

    let html = `${spreadsheetStyles}<div class="xlwb"><div class="xl-sheet"><div class="xl-wrap"><table class="xl"><thead><tr><th class="xl-corner"></th>`;
    for (let col = 1; col <= columnCount; col += 1) {
        html += `<th class="xl-col" data-col="${col}">${getColumnName(col)}</th>`;
    }
    html += "</tr></thead><tbody>";

    normalizedRows.forEach((row, rowIndex) => {
        const rowNumber = rowIndex + 1;
        const displayRowNumber = startRow + rowNumber;
        html += `<tr><th class="xl-row" data-row="${rowNumber}">${displayRowNumber}</th>`;
        for (let col = 1; col <= columnCount; col += 1) {
            const ref = `${getColumnName(col)}${rowNumber}`;
            html += `<td class="xl-cell" data-ref="${ref}">${escapeHtml(row[col - 1] ?? "")}</td>`;
        }
        html += "</tr>";
    });

    html += "</tbody></table></div></div></div>";
    return html;
}

function getDelimiterLabel(delimiter: string) {
    if (delimiter === "\t") return "Tab";
    if (delimiter === ",") return "Comma";
    if (delimiter === ";") return "Semicolon";
    return delimiter;
}

export const CsvViewer = (props: ICsvViewerProps) => {
    const sheetViewRef = useRef<HTMLDivElement | null>(null);
    const tabsRef = useRef<HTMLDivElement | null>(null);
    const [parsedCsv, setParsedCsv] = useState<ParsedCsv | null>(null);
    const [hasError, setHasError] = useState(false);
    const [pageIndex, setPageIndex] = useState(0);

    const pageCount = parsedCsv ? Math.max(1, Math.ceil(parsedCsv.rows.length / CSV_PAGE_SIZE)) : 1;
    const currentPage = Math.min(pageIndex, pageCount - 1);

    const renderSheet = useCallback(() => {
        if (!parsedCsv || !sheetViewRef.current || !tabsRef.current) return;

        const startRow = currentPage * CSV_PAGE_SIZE;
        const pageRows = parsedCsv.rows.slice(startRow, startRow + CSV_PAGE_SIZE);
        sheetViewRef.current.innerHTML = renderSheetHtml(pageRows, startRow);
        sheetViewRef.current.setAttribute("tabindex", "0");
        sheetViewRef.current.focus();

        const tab = tabsRef.current.querySelector("button");
        tab?.classList.add(styles.active);

        const cleanup = attachSelectionHandlers(sheetViewRef.current);
        return cleanup;
    }, [currentPage, parsedCsv]);

    useEffect(() => {
        let isMounted = true;

        const getData = async () => {
            setHasError(false);
            try {
                const text = await props.fileBlob.text();
                const nextParsedCsv = parseCsv(text, props.csvDelimiter, props.fileType);
                if (!isMounted) return;
                setParsedCsv(nextParsedCsv);
                setPageIndex(0);
            } catch {
                if (isMounted) {
                    setParsedCsv(null);
                    setHasError(true);
                }
            }
        };

        void getData();

        return () => {
            isMounted = false;
        };
    }, [props.csvDelimiter, props.fileBlob, props.fileType]);

    useEffect(() => {
        if (!parsedCsv || !tabsRef.current) return;

        const tabsEl = tabsRef.current;
        tabsEl.innerHTML = "";
        const createButton = (label: string, onClick?: () => void) => {
            const btn = document.createElement("button");
            btn.className = styles.tab;
            btn.type = "button";
            btn.textContent = label;
            if (onClick) {
                btn.addEventListener("click", (event) => {
                    event.preventDefault();
                    onClick();
                });
            } else {
                btn.disabled = true;
            }
            return btn;
        };

        const startRow = currentPage * CSV_PAGE_SIZE + 1;
        const endRow = Math.min((currentPage + 1) * CSV_PAGE_SIZE, parsedCsv.rows.length);
        const formatLabel = `${props.fileType.toUpperCase()} (${getDelimiterLabel(parsedCsv.delimiter)})`;

        const formatButton = createButton(formatLabel);
        formatButton.classList.add(styles.active);
        tabsEl.appendChild(formatButton);

        if (pageCount > 1) {
            tabsEl.appendChild(createButton("‹", currentPage > 0 ? () => setPageIndex(currentPage - 1) : undefined));
            tabsEl.appendChild(createButton(`Rows ${startRow}-${endRow} of ${parsedCsv.rows.length}`));
            tabsEl.appendChild(createButton("›", currentPage < pageCount - 1 ? () => setPageIndex(currentPage + 1) : undefined));
        }

        const cleanup = renderSheet();
        return () => {
            if (cleanup) cleanup();
            tabsEl.innerHTML = "";
        };
    }, [currentPage, pageCount, parsedCsv, props.fileType, renderSheet]);

    useEffect(() => {
        if (pageIndex >= pageCount) {
            setPageIndex(pageCount - 1);
        }
    }, [pageCount, pageIndex]);

    if (hasError) return <Error msg="No se pudo visualizar el archivo delimitado." />;

    return (
        <div
            id="pg-csv-viewer-v1"
            className={styles.container}
            data-theme={props.theme ?? "auto"}
        >
            <div
                ref={sheetViewRef}
                id="sheetView"
                className={styles.sheetView}
            />
            <div
                ref={tabsRef}
                id="tabs"
                className={styles.tabs}
            />
        </div>
    );
};
