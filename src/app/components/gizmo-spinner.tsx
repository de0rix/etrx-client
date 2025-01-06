'use client'
import { useEffect, useState } from 'react'
import Styles from './gizmo-spinner.module.css'

type GizmoSpinnerProps = {
    title?: string;
    timeout?: number;
}

export default function GizmoSpinner({title = 'Загрузка...', timeout = 15000}: GizmoSpinnerProps)
{   
    const [loadingMsg, setLoadingMsg] = useState(<>{title}</>);

    timeout = timeout? timeout : 150000;
    const whenTimeout = setTimeout(() => {setLoadingMsg(<>Загрузка занимает слишком много времени<br/>Проверьте подключение.</>);}, timeout);
    
    useEffect(() => {
        return () => {clearTimeout(whenTimeout)};
    }, [timeout]);

    return(
        <>
            <div className={Styles.pad}>
                <div className={`${Styles.loader_generic} ${Styles.loader_more}`}></div>
                <div className={`${Styles.loader_generic} ${Styles.loader}`}></div>
                <p className={Styles.pad_text}>{loadingMsg}</p>
            </div>
        </>
    )
}