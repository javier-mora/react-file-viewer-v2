import React, { PropsWithChildren } from "react";
import { Loading } from "../Loading";
import { Error } from "../Error";
import { Bar } from "../Bar";
import { Content } from "../Content";
import styles from './styles.module.css'

interface IContainerProps {
    isLoading: boolean;
    hasError: boolean;
}

export const Container = (props: PropsWithChildren<IContainerProps>) => {
    return (
        <div className={styles.container}>
            <div>
                {React.Children.map(props.children, (child: React.ReactNode, index) => {
                    if (index == 0 && React.isValidElement(child) && child.type === Bar) {
                        return React.cloneElement(child);
                    }
                })}
            </div>
            <div>
                {props.isLoading && (
                    <div>
                        <Loading/>
                    </div>
                )}
                {props.hasError && (
                    <div>
                        <Error msg="Error al cargar elemento"/>
                    </div>
                )}
                {!props.isLoading && !props.hasError && React.Children.map(props.children, (child: React.ReactNode) => {
                    if (React.isValidElement(child) && child.type === Content) {
                        return React.cloneElement(child);
                    }
                })}
            </div>
        </div>    
    );
};