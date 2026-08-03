'use client';

import { useTranslation } from 'react-i18next';
import { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import { useIsClient } from '@/hooks/useIsClient';
import { useQueryState } from '@/hooks/useQueryState';
import { getUsers, GetUsersArgs } from "@/app/services/users";
import GizmoSpinner from "@/app/components/gizmo-spinner";
import { Table } from "@/app/components/Table";
import { User, UserForTable } from "@/app/models/User";
import { Column, SortOrder } from '../models/TableTypes';

const DEFAULT_SORT_FIELD: keyof User = 'firstName';
const DEFAULT_SORT_ORDER: SortOrder = 'asc';

function UserClientPage() {
    const { t } = useTranslation('user');
    const isClient = useIsClient();

    const { searchParams, setQueryParams } = useQueryState({
        sortField: DEFAULT_SORT_FIELD,
        sortOrder: DEFAULT_SORT_ORDER,
    });

    const sortField = useMemo(() => (searchParams.get('sortField') as keyof User) || DEFAULT_SORT_FIELD, [searchParams]);
    const sortOrder = useMemo(() => (searchParams.get('sortOrder') as SortOrder) || DEFAULT_SORT_ORDER, [searchParams]);

    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        const args = new GetUsersArgs(
            null,
            null,
            sortField,
            sortOrder === 'asc'
        );

        try {
            const response = await getUsers(args);
            if (!response.ok) {
                throw new Error(t('common:error', { statusCode: response.status }));
            }
            const data = await response.json();
            setUsers(data.users || []);
        } catch (err) {
            setError(err as Error);
            setUsers([]);
        } finally {
            setIsLoading(false);
        }
    }, [sortField, sortOrder, t]);

    useEffect(() => {
        if (isClient) {
            fetchData();
        }
    }, [isClient, fetchData]);

    const handleSortChange = (newSortField: keyof UserForTable) => {
        const effectiveSortField = newSortField as keyof User;
        const newSortOrder = (sortField === effectiveSortField && sortOrder === 'asc') ? 'desc' : 'asc';
        
        setQueryParams({
            sortField: effectiveSortField,
            sortOrder: newSortOrder,
        });
    };

    const columns: Column<UserForTable>[] = useMemo(() => [
        { key: 'handle', header: t('user:tableHeaders.handle'), accessor: 'handle' },
        { key: 'firstName', header: t('user:tableHeaders.firstName'), accessor: 'firstName' },
        { key: 'lastName', header: t('user:tableHeaders.lastName'), accessor: 'lastName' },
        { key: 'organization', header: t('user:tableHeaders.organization'), accessor: 'organization' },
        { key: 'city', header: t('user:tableHeaders.city'), accessor: 'city' },
        { key: 'grade', header: t('user:tableHeaders.class'), accessor: 'grade' },
    ], [t]);

    const tableData: UserForTable[] = users.map(user => ({ ...user, id: user.handle }));

    if (!isClient) {
        return <GizmoSpinner />;
    }

    return (
        <>
            <h1 className='text-3xl w-full text-center font-bold my-5'>{t('user:usersTableTitle')}</h1>
            
            <Table
                columns={columns}
                data={tableData}
                isLoading={isLoading}
                error={error}
                
                sortField={sortField}
                sortOrder={sortOrder}
                onSortChange={handleSortChange}

                onRowClick={(user) => window.open(`https://codeforces.com/profile/${user.handle}`)}
            />
        </>
    );
}

export default function Page() {
  return (
    <Suspense fallback={<GizmoSpinner />}>
      <UserClientPage />
    </Suspense>
  );
}