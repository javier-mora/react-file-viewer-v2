import { useEffect, useRef, useState } from "react";
import { renderAsync } from "docx-preview";
import { Error } from "../../ui";

interface IDocxViewerProps {
    fileBlob: Blob;
    width: number | string;
    height: number | string;
}

export const DocxViewer = (props: IDocxViewerProps) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        let isCurrent = true;
        const container = containerRef.current;
        if (!container) return;

        container.replaceChildren();
        setHasError(false);
        void renderAsync(props.fileBlob, container).catch(() => {
            if (isCurrent) setHasError(true);
        });

        return () => {
            isCurrent = false;
            container.replaceChildren();
        };
    }, [props.fileBlob]);

    if (hasError) return <Error msg="No se pudo visualizar el documento." />;

    return (
        <div ref={containerRef}>
        </div>
    );
};
