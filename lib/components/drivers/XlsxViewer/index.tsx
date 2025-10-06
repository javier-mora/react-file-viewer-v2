import { useCallback, useEffect, useRef, useState } from "react";
import { Workbook, XlsxParser } from "xlsx-to-js";
import { attachSelectionHandlers } from "./utils";

import styles from './styles.module.css'

interface IXlsxViewerProps {
    fileBlob: Blob;
    width: number | string;
    height: number | string;
}

export const XlsxViewer = (props: IXlsxViewerProps) => {
    const sheetViewRef = useRef<HTMLDivElement | null>(null);
    const tabsRef = useRef<HTMLDivElement | null>(null);

    const [isLoading, setIsLoading] = useState(true);
    const [parser, setParser] = useState<XlsxParser | null>(null);
    const [workbook, setWorkbook] = useState<Workbook | null>(null);

    const renderSheet = useCallback((index: number) => {
        if (!parser || !workbook || !sheetViewRef.current || !tabsRef.current) return;

        sheetViewRef.current.innerHTML = parser.toHTMLSheet(workbook, index);
        sheetViewRef.current.setAttribute("tabindex", "0");
        sheetViewRef.current.focus();

        const buttons = Array.from(tabsRef.current.children);
        // Toggle module-aware active class for tabs
        buttons.forEach((el, i) => el.classList.toggle(styles.active, i === index));

        const cleanup = attachSelectionHandlers(sheetViewRef.current);
        return cleanup;
    }, [parser, workbook]);

    useEffect(() => {
        const getData = async () => {
            setIsLoading(true);
            const buffer = await props.fileBlob.arrayBuffer();
            const p = new XlsxParser();
            const wb = await p.readFile(buffer, {
                dense: true,
                styles: true,
                drawings: true,
                skipHiddenRows: true
            });

            setParser(p);
            setWorkbook(wb);
            setIsLoading(false);
        };
        getData();
    }, [props.fileBlob]);

    useEffect(() => {
        if (isLoading || !workbook || !tabsRef.current) return;

        const tabsEl = tabsRef.current;
        tabsEl.innerHTML = "";
        workbook.workSheets.forEach((ws, i) => {
            const btn = document.createElement("button");
            btn.className = styles.tab;
            btn.textContent = ws.name || `Sheet ${i + 1}`;
            btn.addEventListener("click", (e) => {
                e?.preventDefault();
                renderSheet(i);
            });
            tabsEl.appendChild(btn);
        });

        const cleanup = renderSheet(0);
        return () => {
            if (cleanup) cleanup();
            Array.from(tabsEl.children).forEach((child) => {
                const clone = child.cloneNode(true);
                tabsEl.replaceChild(clone, child);
            });
            tabsEl.innerHTML = "";
        };
    }, [workbook, renderSheet, isLoading]);

    return (
        <div id="pg-xlsx-viewer-v1" className={styles.container}>
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
