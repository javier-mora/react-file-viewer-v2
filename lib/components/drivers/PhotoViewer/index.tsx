import React from "react";
import { Bar, Button, Container, Content } from "../../ui";

interface IPhotoViewerProps {
  filePath: string;
  width?: number | string;
  height?: number | string;
}

export const PhotoViewer = (props: IPhotoViewerProps) => {
  const [zoom, setZoom] = React.useState(0.25);

  const reduceZoom = () => {
    setZoom(prev => (prev - 0.25) > 0.25 ? (prev - 0.25) : 0.25);
  };

  const increaseZoom = () => {
    setZoom(prev => (prev + 0.25) < 2 ? (prev + 0.25) : 2);
  };

  return (
    <Container isLoading={false} hasError={false}>
      <Bar>
        <Button label="+" onClick={increaseZoom} />
        <Button label="-" onClick={reduceZoom} />
      </Bar>
      <Content>
        <iframe 
            title="image"
            src={props.filePath} 
            width={props.width ?? "100%"}
            height={props.height ?? "500px"}
            style={{ transformOrigin: '0 0', transform: `scale(${zoom})` }}
        />
      </Content>
    </Container>
  );
};
