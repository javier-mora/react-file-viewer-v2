import React, { useEffect } from "react";
import { Loading } from "../../ui";

interface IXlsxViewerProps {
    filePath: string;
    width: number | string;
    height: number | string;
}

export const XlsxViewer = (props: IXlsxViewerProps) => {
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