'use client';

import { useTranslation } from 'react-i18next';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useIsClient } from '@/hooks/useIsClient';
import { unixToFormattedDate } from '@/libs/date';
import { getContests, GetContestsArgs } from './services/contests';
import GizmoSpinner from './components/gizmo-spinner';
import { Table } from './components/Table';
import { Contest, ContestForTable } from '@/app/models/Contest';
import { Column } from './models/TableTypes';

export default function Page() {
  const { t, i18n } = useTranslation('home');
  const isClient = useIsClient();

  const [contests, setContests] = useState<Contest[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const args = new GetContestsArgs(
      1,
      10,
      'startTime',
      false,
      null,
      null,
      null,
      i18n.language,
    );

    try {
      const response = await getContests(args);
      if (!response.ok) {
        throw new Error(t('common:error', { statusCode: response.status }));
      }
      const data = await response.json();
      setContests(data.contests || []);
    } catch (err) {
      setError(err as Error);
      setContests([]);
    } finally {
      setIsLoading(false);
    }
  }, [i18n.language, t]);

  useEffect(() => {
    if (isClient) {
      fetchData();
    }
  }, [isClient, fetchData]);

  const columns: Column<ContestForTable>[] = useMemo(
    () => [
      {
        key: 'contestId',
        header: t('home:tableHeaders.id'),
        accessor: 'contestId',
        isSortable: false,
      },
      {
        key: 'name',
        header: t('home:tableHeaders.name'),
        accessor: 'name',
        isSortable: false,
      },
      {
        key: 'isContestLoaded',
        header: t('contest:tableHeaders.isContestLoaded'),
        accessor: 'isContestLoaded',
        headerHint: t('contest:hints.isContestLoaded'),
        render: (item) => (
          <div className="flex items-center justify-center">
            {item.isContestLoaded ? '' : '✖'}
          </div>
        ),
      },
      {
        key: 'startTime',
        header: t('home:tableHeaders.startTime'),
        accessor: 'startTime',
        render: (contest) => unixToFormattedDate(contest.startTime, t),
        isSortable: false,
      },
    ],
    [t],
  );

  const tableData: ContestForTable[] = contests.map((contest) => ({
    ...contest,
    id: contest.contestId,
  }));

  if (!isClient) {
    return <GizmoSpinner />;
  }

  return (
    <>
      <h1 className="text-3xl w-full text-center font-bold my-5">
        {t('home:lastContests')}
      </h1>

      <Table
        columns={columns}
        data={tableData}
        isLoading={isLoading}
        error={error}
        onRowClick={(contest) =>
          window.open(`/etrx2/contest/${contest.contestId}`)
        }
      />
    </>
  );
}
