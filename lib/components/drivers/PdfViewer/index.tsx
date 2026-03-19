import { Container, Content } from "../../ui";

interface IPdfViewerProps {
    filePath: string;
    width?: number | string;
    height?: number | string;
}

export const PdfViewer = (props: IPdfViewerProps) => {
    return (
        <Container isLoading={false} hasError={false}>
            <Content>
                <div
                    style={{
                        width: typeof props.width === "number" ? `${props.width}px` : (props.width ?? "100%"),
                        height: typeof props.height === "number" ? `${props.height}px` : (props.height ?? "100%"),
                        minWidth: 0,
                        minHeight: 0,
                        overflow: "hidden",
                    }}
                >
                    <iframe 
                        title="pdf"
                        src={props.filePath}
                        width="100%"
                        height="100%"
                        style={{
                            display: "block",
                            border: 0,
                            width: "100%",
                            height: "100%",
                        }}
                    />
                </div>
            </Content>
        </Container>
    );
};
