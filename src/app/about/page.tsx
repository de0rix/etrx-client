'use client';

import { useTranslation } from 'react-i18next';
import GizmoSpinner from '../components/gizmo-spinner';
import Styles from '../components/network-table.module.css';
import { useIsClient } from '@/hooks/useIsClient';
import { UpdateData } from '@/app/models/Updates';
import { UpdateRow } from '../components/UpdateRow';

export default function Page() {
  const { t } = useTranslation();
  const isClient = useIsClient();

  const updates = t('about:updates', { returnObjects: true }) as UpdateData[];

  if (!isClient) {
    return <GizmoSpinner />;
  }

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-bold text-center my-5">
        {t('about:updatesTitle')}
      </h1>
      <div className={Styles.container}>
        <table className={Styles.table}>
          <thead>
            <tr>
              <th className={Styles.th}>{t('about:version')}</th>
              <th className={Styles.th}>{t('about:author')}</th>
              <th className={Styles.th}>{t('about:changes')}</th>
            </tr>
          </thead>
          <tbody>
            {updates.map((update) => (
              <UpdateRow key={update.date} update={update} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
