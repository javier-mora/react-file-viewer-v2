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

function renderSheetHtml(rows: string[][]) {
    const columnCount = Math.max(1, ...rows.map((row) => row.length));
    const normalizedRows = rows.length > 0 ? rows : [[""]];

    let html = '<table class="xl"><thead><tr><th></th>';
    for (let col = 1; col <= columnCount; col += 1) {
        html += `<th class="xl-col" data-col="${col}">${getColumnName(col)}</th>`;
    }
    html += "</tr></thead><tbody>";

    normalizedRows.forEach((row, rowIndex) => {
        const rowNumber = rowIndex + 1;
        html += `<tr><th class="xl-row" data-row="${rowNumber}">${rowNumber}</th>`;
        for (let col = 1; col <= columnCount; col += 1) {
            const ref = `${getColumnName(col)}${rowNumber}`;
            html += `<td data-ref="${ref}">${escapeHtml(row[col - 1] ?? "")}</td>`;
        }
        html += "</tr>";
    });

    html += "</tbody></table>";
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

    const renderSheet = useCallback(() => {
        if (!parsedCsv || !sheetViewRef.current || !tabsRef.current) return;

        sheetViewRef.current.innerHTML = renderSheetHtml(parsedCsv.rows);
        sheetViewRef.current.setAttribute("tabindex", "0");
        sheetViewRef.current.focus();

        const tab = tabsRef.current.querySelector("button");
        tab?.classList.add(styles.active);

        const cleanup = attachSelectionHandlers(sheetViewRef.current);
        return cleanup;
    }, [parsedCsv]);

    useEffect(() => {
        let isMounted = true;

        const getData = async () => {
            setHasError(false);
            try {
                const text = await props.fileBlob.text();
                const nextParsedCsv = parseCsv(text, props.csvDelimiter, props.fileType);
                if (!isMounted) return;
                setParsedCsv(nextParsedCsv);
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
        const btn = document.createElement("button");
        btn.className = styles.tab;
        btn.textContent = `${props.fileType.toUpperCase()} (${getDelimiterLabel(parsedCsv.delimiter)})`;
        btn.addEventListener("click", (event) => {
            event.preventDefault();
            renderSheet();
        });
        tabsEl.appendChild(btn);

        const cleanup = renderSheet();
        return () => {
            if (cleanup) cleanup();
            tabsEl.innerHTML = "";
        };
    }, [parsedCsv, props.fileType, renderSheet]);

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
