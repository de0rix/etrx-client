'use client';

import { useTranslation } from 'react-i18next';
import { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import { useIsClient } from '@/hooks/useIsClient';
import { useQueryState } from '@/hooks/useQueryState';
import { createUser, deleteUser, getUsers, GetUsersArgs } from "@/app/services/users";
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
    const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
    const [newUser, setNewUser] = useState<User>({ handle: '', firstName: '', lastName: '', organization: '', city: '', grade: '' });
    const [actionError, setActionError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

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

    const updateNewUser = (field: keyof User, value: string) => {
        setNewUser((current) => ({ ...current, [field]: value }));
    };

    const handleAddUser = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSubmitting(true);
        setActionError(null);
        try {
            const response = await createUser(newUser);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            setNewUser({ handle: '', firstName: '', lastName: '', organization: '', city: '', grade: '' });
            setIsAddMenuOpen(false);
            await fetchData();
        } catch (err) {
            setActionError(`Не удалось добавить пользователя: ${(err as Error).message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteUser = async (handle: string) => {
        if (!window.confirm(`Удалить пользователя ${handle}?`)) return;
        setActionError(null);
        try {
            const response = await deleteUser(handle);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            await fetchData();
        } catch (err) {
            setActionError(`Не удалось удалить пользователя: ${(err as Error).message}`);
        }
    };

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
        { key: 'grade', header: t('user:tableHeaders.grade'), accessor: 'grade' },
        {
            key: 'actions', header: '', accessor: 'handle', isSortable: false,
            render: (user) => (
                <div className="flex justify-center">
                    <button type="button" className="rounded border border-red-500 px-2 py-1 text-red-500 hover:bg-red-500 hover:text-white"
                        onClick={(event) => { event.stopPropagation(); void handleDeleteUser(user.handle); }}>
                        {t('user:actions.delete')}
                    </button>
                </div>
            ),
        },
    ], [t]);

    const tableData: UserForTable[] = users.map(user => ({ ...user, id: user.handle }));

    if (!isClient) {
        return <GizmoSpinner />;
    }

    return (
        <>
            <h1 className='text-3xl w-full text-center font-bold my-5'>{t('user:usersTableTitle')}</h1>
            <div className="mb-5 flex flex-col items-center gap-3">
                <button type="button" className="rounded bg-[var(--main)] px-4 py-2 font-bold text-[var(--main-white)]"
                    onClick={() => { setIsAddMenuOpen((open) => !open); setActionError(null); }} aria-expanded={isAddMenuOpen}>
                    {t('user:actions.add')}
                </button>
                {isAddMenuOpen && (
                    <form onSubmit={handleAddUser} className="grid w-full max-w-2xl grid-cols-1 gap-3 rounded-lg border border-[var(--background-shade1)] p-4 sm:grid-cols-2">
                        {(Object.keys(newUser) as Array<keyof User>).map((field) => (
                            <label key={field} className="flex flex-col gap-1">
                                <span>{t(`user:tableHeaders.${field}`)}</span>
                                <input required className="rounded border border-[var(--background-shade1)] bg-[var(--background)] px-3 py-2"
                                    value={newUser[field]} onChange={(event) => updateNewUser(field, event.target.value)} />
                            </label>
                        ))}
                        <div className="flex gap-3 justify-center sm:col-span-2">
                            <button type="submit" disabled={isSubmitting} className="rounded bg-[var(--main)] px-4 py-2 font-bold text-[var(--main-white)]">
                                {isSubmitting ? t('user:actions.saving') : t('user:actions.save')}
                            </button>
                            <button type="button" disabled={isSubmitting} className="rounded border border-[var(--background-shade1)] px-4 py-2"
                                onClick={() => setNewUser({ handle: '', firstName: '', lastName: '', organization: '', city: '', grade: '' })}>
                                {t('user:actions.clear')}
                            </button>
                        </div>
                    </form>
                )}
                {actionError && <div className="text-red-500">{actionError}</div>}
            </div>
            
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