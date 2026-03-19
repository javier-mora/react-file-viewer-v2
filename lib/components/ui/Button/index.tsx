import styles from './styles.module.css'

interface IButtonProps {
    label: string;
    icon?: React.ReactNode;
    onClick?: () => void;
    theme?: "auto" | "light" | "dark";
}

export const Button = (props: IButtonProps) => {
    return (
        <button className={styles.button} data-theme={props.theme ?? "auto"} onClick={(o) => {
            o?.preventDefault();
            if (props.onClick) props.onClick();
        }} 
        type='button'
        >
            {props.icon}{props.label}
        </button>   
    );
};
