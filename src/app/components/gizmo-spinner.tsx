'use client';
import { useEffect, useState } from 'react';
import Styles from './gizmo-spinner.module.css';
import { useTranslation } from 'react-i18next';
import '../../i18n/client';

export default function GizmoSpinner() {
  const { t } = useTranslation();
  const [loadingMsg, setLoadingMsg] = useState(<>{t('common:loading')}</>);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    const timeout = setTimeout(() => {
      setLoadingMsg(
        <>
          {t('common:loadingTooLong')}
          <br />
          {t('common:checkConnection')}
        </>,
      );
    }, 15000);

    return () => clearTimeout(timeout);
  }, [t]);

  if (!isClient) {
    return <div className="gizmo-spinner-container"></div>;
  }

  return (
    <div className="gizmo-spinner-container">
      <div className={Styles.pad}>
        <div className={`${Styles.loader_generic} ${Styles.loader_more}`}></div>
        <div className={`${Styles.loader_generic} ${Styles.loader}`}></div>
        <p className={Styles.pad_text}>{loadingMsg}</p>
      </div>
    </div>
  );
}
