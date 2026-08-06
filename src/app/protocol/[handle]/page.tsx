'use client';

import {
  Suspense,
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
} from 'react';
import { useTranslation } from 'react-i18next';
import 'react-datepicker/dist/react-datepicker.css';
import {
  getUserProtocol,
  GetUserProtocolArgs,
} from '../../services/submissions';
import GizmoSpinner from '@/app/components/gizmo-spinner';
import { Table } from '@/app/components/Table';
import { Column } from '@/app/models/TableTypes';
import { UserProtocol, UserProtocolForTable } from '../../models/Submission';
import { useParams, useSearchParams } from 'next/navigation';
import { User } from '@/app/models/User';
import { getUser } from '@/app/services/users';
import { unixToFormattedDateTime } from '@/libs/date';

function ProtocolClientPage() {
  const { t } = useTranslation('protocol');

  const handle = String(useParams().handle);

  const searchParams = useSearchParams();

  const fromToDate = useMemo(() => {
    return {
      fYear: Number(searchParams.get('fYear')),
      fMonth: Number(searchParams.get('fMonth')),
      fDay: Number(searchParams.get('fDay')),
      tYear: Number(searchParams.get('tYear')),
      tMonth: Number(searchParams.get('tMonth')),
      tDay: Number(searchParams.get('tDay')),
    };
  }, [searchParams]);

  const isMounted = useRef(true);

  const [user, setUser] = useState<User>();
  const [submissions, setSubmissions] = useState<UserProtocol[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const args = new GetUserProtocolArgs(
      handle,
      fromToDate.fYear,
      fromToDate.fMonth,
      fromToDate.fDay,
      fromToDate.tYear,
      fromToDate.tMonth,
      fromToDate.tDay,
    );

    try {
      const response = await getUserProtocol(args);
      if (!isMounted.current) return;
      if (!response.ok)
        throw new Error(t('common:error', { statusCode: response.status }));

      const data = await response.json();
      setSubmissions(data || []);
    } catch (err) {
      if (!isMounted.current) return;
      setError(err as Error);
      setSubmissions([]);
    } finally {
      if (!isMounted.current) return;
      setIsLoading(false);
    }
  }, [t, handle, fromToDate]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userResponse = await getUser(handle);
        if (!userResponse.ok)
          throw new Error(
            t('common:error', { statusCode: userResponse.status }),
          );
        const user: User = await userResponse.json();
        setUser(user);
      } catch (err) {
        setError(err as Error);
      }
    };

    fetchUser();
  }, [t, handle]);

  useEffect(() => {
    isMounted.current = true;
    fetchData();
    return () => {
      isMounted.current = false;
    };
  }, [fetchData]);

  const columns: Column<UserProtocolForTable>[] = useMemo(
    () => [
      {
        key: 'lastTime',
        header: t('protocol:tableHeaders.lastTime'),
        accessor: 'lastTime',
        render: (item) => unixToFormattedDateTime(item.lastTime, t),
      },
      {
        key: 'contestId',
        header: t('protocol:tableHeaders.contestId'),
        accessor: 'contestId',
      },
      {
        key: 'solvedCount',
        header: t('protocol:tableHeaders.solvedCount'),
        accessor: 'solvedCount',
      },
    ],
    [t],
  );

  const tableData: UserProtocolForTable[] = submissions.map((sub) => ({
    ...sub,
    id: `${sub.contestId}`,
  }));

  return (
    <>
      <h1 className="text-3xl w-full text-center font-bold mb-5">{`${t('protocol:protocolTableTitle')}: ${user?.lastName} ${user?.firstName}`}</h1>

      <Table
        columns={columns}
        data={tableData}
        isLoading={isLoading}
        error={error}
        onRowClick={(sub) =>
          window.open(
            `/etrx2/protocol/${handle}/${sub.contestId}?` +
              `fDay=${fromToDate.fDay}&fMonth=${fromToDate.fMonth}&fYear=${fromToDate.fYear}` +
              `&tDay=${fromToDate.tDay}&tMonth=${fromToDate.tMonth}&tYear=${fromToDate.tYear}`,
          )
        }
      />
    </>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<GizmoSpinner />}>
      <ProtocolClientPage />
    </Suspense>
  );
}
