import { PropsWithChildren } from "react";
import styles from "./styles.module.css";

interface IContentProps {
    padding?: string;
}

export const Content = (props: PropsWithChildren<IContentProps>) => {
    return (
        <div className={styles.content}>
            {props.children}
        </div>    
    );
};
