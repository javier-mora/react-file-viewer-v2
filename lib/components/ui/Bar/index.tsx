import { PropsWithChildren } from "react";
import styles from './styles.module.css'

interface IBarProps {
    padding?: string;
    theme?: "auto" | "light" | "dark";
}

export const Bar = (props: PropsWithChildren<IBarProps>) => {
    return (
        <div className={styles.containerBar} data-theme={props.theme ?? "auto"}>
            {props.children}
        </div>    
    );
};
