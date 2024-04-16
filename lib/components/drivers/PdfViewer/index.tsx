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
                <iframe 
                    title="pdf"
                    src={props.filePath} 
                    width={props.width ?? "100%"}
                    height={props.height ?? "500px"}
                />
            </Content>
        </Container>
    );
};