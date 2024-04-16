import styles from './styles.module.css';

export const Loading = () => {
    return (
        <div className={styles.loadingContainer}>
            <div className={styles.loader}>
                <ul>
                    <li className={styles.ball}></li>
                    <li className={styles.ball}></li>
                    <li className={styles.ball}></li>
                </ul>
            </div>
            <div>
                Cargando...    
            </div>
        </div>    
    );
};