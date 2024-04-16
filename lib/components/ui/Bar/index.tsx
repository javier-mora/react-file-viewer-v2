import { PropsWithChildren } from "react";
import styles from './styles.module.css'

interface IBarProps {
    padding?: string;
}

export const Bar = (props: PropsWithChildren<IBarProps>) => {
    return (
        <div className={styles.containerBar}>
            {props.children}
        </div>    
    );
};