import { Container, Content } from "../../ui";

interface IVideoViewerProps {
    filePath: string;
    fileType: string;
    width?: number | string;
    height?: number | string;
}

export const VideoViewer = (props: IVideoViewerProps) => {
    return (
        <Container isLoading={false} hasError={false}>
            <Content>
            <video 
                itemType={`video/${props.fileType}`}
                src={props.filePath}
                width={props.width ?? "100%"} 
                height={props.height ?? "500px"} 
                controls
            >
                Video playback is not supported by your browser.
            </video>
            </Content>
        </Container>
    );
};