import styles from './styles.module.css'

interface IButtonProps {
    label: string;
    icon?: React.ReactNode;
    onClick?: () => void;
}

export const Button = (props: IButtonProps) => {
    return (
        <button className={styles.button} onClick={props.onClick}>
            {props.icon}{props.label}
        </button>   
    );
};