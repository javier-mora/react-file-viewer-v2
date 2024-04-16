import React, { useEffect } from "react";
import { Loading } from "../../ui";

interface IPptxViewerProps {
    filePath: string;
    width: number | string;
    height: number | string;
}

export const PptxViewer = (props: IPptxViewerProps) => {
    const [isLoading, setIsLoading] = React.useState(true);

    useEffect(() => {
        setIsLoading(false);
    }, []);

    return (
        <div>
            {isLoading && (
                <div>
                    <Loading/>
                </div>
            )}
            {!isLoading && (
                <div>
                    {props.filePath}
                </div>
            )}
        </div>
    );
};