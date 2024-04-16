import { PropsWithChildren } from "react";

interface IContentProps {
    padding?: string;
}

export const Content = (props: PropsWithChildren<IContentProps>) => {
    return (
        <div>
            {props.children}
        </div>    
    );
};