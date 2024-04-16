import { useEffect } from "react";
import { renderAsync } from "docx-preview";

interface IDocxViewerProps {
    fileBlob: Blob;
    width: number | string;
    height: number | string;
}

export const DocxViewer = (props: IDocxViewerProps) => {
    useEffect(() => {
        renderAsync(props.fileBlob, document.getElementById("docx-container")!);
    }, [props.fileBlob]);

    return (
        <div id="docx-container">
        </div>
    );
};