import React from "react";
import { Bar, Button, Container, Content } from "../../ui";

interface IPhotoViewerProps {
  filePath: string;
  width?: number | string;
  height?: number | string;
  theme?: "auto" | "light" | "dark";
}

export const PhotoViewer = (props: IPhotoViewerProps) => {
  const [zoom, setZoom] = React.useState(1);
  const [naturalSize, setNaturalSize] = React.useState({ width: 0, height: 0 });
  const [viewportSize, setViewportSize] = React.useState({ width: 0, height: 0 });
  const viewportRef = React.useRef<HTMLDivElement | null>(null);
  const contentHeight =
    typeof props.height === "number"
      ? `${Math.max(props.height - 40, 0)}px`
      : props.height
        ? `calc(${props.height} - 40px)`
        : "450px";

  React.useLayoutEffect(() => {
    const element = viewportRef.current;
    if (!element) return;

    const measure = () => {
      setViewportSize({
        width: element.clientWidth,
        height: element.clientHeight,
      });
    };

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [props.width, props.height]);

  const reduceZoom = () => {
    setZoom(prev => (prev - 0.25) > 0.25 ? (prev - 0.25) : 0.25);
  };

  const increaseZoom = () => {
    setZoom(prev => (prev + 0.25) < 2 ? (prev + 0.25) : 2);
  };

  const baseScale =
    naturalSize.width > 0 &&
    naturalSize.height > 0 &&
    viewportSize.width > 0 &&
    viewportSize.height > 0
      ? Math.min(
          viewportSize.width / naturalSize.width,
          viewportSize.height / naturalSize.height
        )
      : 1;

  const renderedWidth = naturalSize.width > 0 ? naturalSize.width * baseScale * zoom : undefined;
  const renderedHeight = naturalSize.height > 0 ? naturalSize.height * baseScale * zoom : undefined;
  const viewportWidth = viewportSize.width > 0 ? `${viewportSize.width}px` : "100%";
  const viewportHeight = viewportSize.height > 0 ? `${viewportSize.height}px` : "100%";
  const zoomLabel = `${Math.round(zoom * 100)}%`;

  return (
    <Container isLoading={false} hasError={false}>
      <Bar theme={props.theme}>
        <Button label="-" onClick={reduceZoom} theme={props.theme} />
        <span
          style={{
            minWidth: "56px",
            textAlign: "center",
            fontSize: "12px",
            fontWeight: 600,
            color: "inherit",
            fontFamily: "Segoe UI, Arial, sans-serif",
          }}
        >
          {zoomLabel}
        </span>
        <Button label="+" onClick={increaseZoom} theme={props.theme} />
      </Bar>
      <Content>
        <div
          ref={viewportRef}
          style={{
            width: typeof props.width === "number" ? `${props.width}px` : (props.width ?? "100%"),
            height: contentHeight,
            overflow: "auto",
            backgroundColor: "#f8fafc",
          }}
        >
          <div
            style={{
              width: renderedWidth ? `max(${viewportWidth}, ${renderedWidth}px)` : "100%",
              height: renderedHeight ? `max(${viewportHeight}, ${renderedHeight}px)` : "100%",
              minWidth: "100%",
              minHeight: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <img
              alt="preview"
              src={props.filePath}
              onLoad={(event) => {
                setNaturalSize({
                  width: event.currentTarget.naturalWidth,
                  height: event.currentTarget.naturalHeight,
                });
              }}
              style={{
                display: "block",
                width: renderedWidth ? `${renderedWidth}px` : "100%",
                height: renderedHeight ? `${renderedHeight}px` : "100%",
                maxWidth: "none",
                maxHeight: "none",
                objectFit: "contain",
                flex: "0 0 auto",
              }}
            />
          </div>
        </div>
      </Content>
    </Container>
  );
};
