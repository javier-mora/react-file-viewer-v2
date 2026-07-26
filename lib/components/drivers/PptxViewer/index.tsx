import React, { useCallback } from "react";
import { pptxToHtml } from "@jvmr/pptx-to-html";
import { Button, Loading } from "../../ui";
import styles from './styles.module.css';

interface IPptxViewerProps {
    fileBlob: Blob;
    width: number | string;
    height: number | string;
    theme?: "auto" | "light" | "dark";
}

export const PptxViewer = (props: IPptxViewerProps) => {
    const containerRef = React.useRef<HTMLDivElement | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [slides, setSlides] = React.useState<string[]>([]);
    const [idx, setIdx] = React.useState(0);
    const [resolvedTheme, setResolvedTheme] = React.useState<"light" | "dark">("light");

    const numericSize = React.useMemo(() => {
        const w = typeof props.width === 'number' ? props.width : undefined;
        const h = typeof props.height === 'number' ? props.height : undefined;
        return { width: w, height: h };
    }, [props.width, props.height]);

    React.useEffect(() => {
        let isMounted = true;
        const load = async () => {
            setIsLoading(true);
            try {
                const buf = await props.fileBlob.arrayBuffer();
                const s = await pptxToHtml(buf, {
                    width: numericSize.width,
                    height: (numericSize.height ?? 100) - 60,
                    scaleToFit: true,
                    letterbox: true
                });
                if (!isMounted) return;
                setSlides(s);
                setIdx(0);
            } catch (e) {
                if (isMounted) setSlides([]);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };
        load();
        return () => { isMounted = false; };
    }, [props.fileBlob, numericSize.width, numericSize.height]);

    React.useEffect(() => {
        if (props.theme === "light" || props.theme === "dark") {
            setResolvedTheme(props.theme);
            return;
        }

        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const syncTheme = () => {
            setResolvedTheme(mediaQuery.matches ? "dark" : "light");
        };

        syncTheme();
        mediaQuery.addEventListener("change", syncTheme);

        return () => {
            mediaQuery.removeEventListener("change", syncTheme);
        };
    }, [props.theme]);

    const toolbarStyle = resolvedTheme === "dark"
        ? {
            background: "linear-gradient(180deg, #2b3038 0%, #20252c 100%)",
            color: "#e7ebf0",
            borderTop: "1px solid #3a4049",
        }
        : {
            background: "linear-gradient(180deg, #f7f8fa 0%, #eef1f4 100%)",
            color: "#3b4351",
            borderTop: "1px solid #d7dce3",
        };

    const capsuleStyle = resolvedTheme === "dark"
        ? {
            background: "linear-gradient(180deg, #2b3038 0%, #20252c 100%)",
            border: "1px solid #3a4049",
            color: "#e7ebf0",
        }
        : {
            background: "linear-gradient(180deg, #f7f8fa 0%, #eef1f4 100%)",
            border: "1px solid #d7dce3",
            color: "#3b4351",
        };

    const goPrev = () => setIdx((v) => Math.max(0, v - 1));
    const goNext = useCallback(() => setIdx((v) => Math.min(slides.length - 1, v + 1)), [slides.length]);

    React.useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') { goPrev(); }
            else if (e.key === 'ArrowRight') { goNext(); }
        };
        const el = containerRef.current;
        if (el) el.addEventListener('keydown', onKey);
        return () => { if (el) el.removeEventListener('keydown', onKey); };
    }, [goNext, slides.length]);

    return (
        <div
            ref={containerRef}
            className={styles.container}
            tabIndex={0}
            style={{ width: typeof props.width === 'number' ? `${props.width}px` : props.width, height: typeof props.height === 'number' ? `${props.height}px` : props.height }}
        >
            {isLoading && (
                <Loading />
            )}
            {!isLoading && slides.length > 0 && (
                <div id="pg-pptx-viewer-v1" className={styles.viewer}>
                    <div className={styles.stage}
                         dangerouslySetInnerHTML={{ __html: slides[idx] }} />
                    <div className={styles.toolbar} style={toolbarStyle}>
                        <div className={styles.navbar} style={capsuleStyle}>
                            <Button label="‹" onClick={goPrev} theme={props.theme} />
                            <span className={styles.counter}>{idx + 1} of {slides.length}</span>
                            <Button label="›" onClick={goNext} theme={props.theme} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
