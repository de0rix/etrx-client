'use client';

import { useEffect, useState, useMemo, useCallback, useRef, Suspense } from "react";
import { useTranslation } from 'react-i18next';
import { useIsClient } from "@/hooks/useIsClient";
import { useQueryState } from "@/hooks/useQueryState";
import { GetContestsArgs, getContests } from "@/app/services/contests";
import { unixToFormattedDate } from "@/libs/date";
import { Table } from "@/app/components/Table";
import ContestFilterSidebar from "@/app/components/contest-filter-sidebar";
import GizmoSpinner from "@/app/components/gizmo-spinner";
import { Column, SortOrder } from "@/app/models/TableTypes";
import { Contest, ContestForTable } from "@/app/models/Contest";

const DEFAULT_PAGE = 1;
const DEFAULT_SORT_FIELD: keyof Contest = 'startTime';
const DEFAULT_SORT_ORDER: SortOrder = 'desc';
const DEFAULT_GYM_FILTER = 2; 

function ContestClientPage() {
    const { t, i18n } = useTranslation();
    const isClient = useIsClient();

    const { searchParams, setQueryParams } = useQueryState({
        page: DEFAULT_PAGE,
        sortField: DEFAULT_SORT_FIELD,
        sortOrder: DEFAULT_SORT_ORDER,
        gymFilter: DEFAULT_GYM_FILTER,
        source: null,
        contestId: null,
    });

    const page = useMemo(() => Number(searchParams.get('page')) || DEFAULT_PAGE, [searchParams]);
    const sortField = useMemo(() => (searchParams.get('sortField') as keyof Contest) || DEFAULT_SORT_FIELD, [searchParams]);
    const sortOrder = useMemo(() => (searchParams.get('sortOrder') as SortOrder) || DEFAULT_SORT_ORDER, [searchParams]);
    const gymFilter = useMemo(() => {
        const param = searchParams.get('gymFilter');
        return param !== null ? Number(param) : DEFAULT_GYM_FILTER;
    }, [searchParams]);
    const source = useMemo(() => searchParams.get('source') || '', [searchParams]);
    const contestId = useMemo(() => searchParams.get('contestId') || '', [searchParams]);

    const [contests, setContests] = useState<Contest[]>([]);
    const [maxPage, setMaxPage] = useState<number>(1);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);
    const [isFiltersCollapsed, setIsFiltersCollapsed] = useState(false);
    
    const isMounted = useRef(true);

    const fetchData = useCallback(async () => {
        const args = new GetContestsArgs(
            page,
            100,
            sortField,
            sortOrder === 'asc',
            gymFilter == 2 ? null : gymFilter == 1,
            source || null,
            contestId ? Number(contestId) : null,
            i18n.language
        );

        try {
            const response = await getContests(args);
            if (!isMounted.current) return;

            if (!response.ok) {
                throw new Error(t('common:error', { statusCode: response.status }));
            }
            const data = await response.json();
            setContests(data.contests || []);
            setMaxPage(data.pageCount || 1);
        } catch (err) {
            if (!isMounted.current) return;
            setError(err as Error);
            setContests([]);
        } finally {
            if (!isMounted.current) return;
            setIsLoading(false);
        }
    }, [page, sortField, sortOrder, gymFilter, source, contestId, i18n.language, t]);

    useEffect(() => {
        isMounted.current = true;
        if (isClient) {
            setIsLoading(true);
            setError(null);
            fetchData();
        }
        return () => {
            isMounted.current = false;
        };
    }, [isClient, fetchData]);

    const handleSortChange = (newSortField: keyof ContestForTable) => {
        const effectiveSortField = newSortField === 'id' ? 'contestId' : newSortField;
        const newSortOrder = (sortField === effectiveSortField && sortOrder === 'asc') ? 'desc' : 'asc';

        setQueryParams({
            sortField: effectiveSortField,
            sortOrder: newSortOrder,
            page: 1, 
        });
    };

    const handlePageChange = (newPage: number) => {
        setQueryParams({ page: newPage });
    };

    const columns: Column<ContestForTable>[] = useMemo(() => [
        { 
            key: 'contestId', 
            header: t('contest:tableHeaders.id'), 
            accessor: 'contestId' 
        },
        { 
            key: 'Name', 
            header: t('contest:tableHeaders.name'), 
            accessor: 'name' 
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
            header: t('contest:tableHeaders.startTime'),
            accessor: 'startTime',
            render: (item) => unixToFormattedDate(item.startTime, t),
        },
    ], [t]);

    const tableData: ContestForTable[] = contests.map(c => ({ ...c, id: c.contestId }));

    const sourceOptions = Array.from([ 'Codeforces', 'IOI' ]);

    if (!isClient) {
        return <GizmoSpinner />;
    }

    return (
        <div className="flex flex-col md:flex-row gap-8 items-start mt-6">
            <div className={`filterSidebarShell ${isFiltersCollapsed ? "filterSidebarShellCollapsed" : ""}`}>
                <ContestFilterSidebar
                    initialGymFilter={gymFilter}
                    initialSource={source}
                    initialContestId={contestId}
                    sourceOptions={sourceOptions}
                    onApply={({ gymFilter: nextGymFilter, source: nextSource, contestId: nextContestId }) => {
                        setQueryParams({
                            gymFilter: nextGymFilter,
                            source: nextSource || null,
                            contestId: nextContestId || null,
                            sortField: nextGymFilter === 1 ? 'contestId' : DEFAULT_SORT_FIELD,
                            sortOrder: nextGymFilter === 1 ? 'desc' : DEFAULT_SORT_ORDER,
                            page: 1,
                        });
                    }}
                />
                <button
                    type="button"
                    className="filterSidebarToggle"
                    aria-label={isFiltersCollapsed ? "Показать фильтры" : "Скрыть фильтры"}
                    aria-expanded={!isFiltersCollapsed}
                    onClick={() => setIsFiltersCollapsed((collapsed) => !collapsed)}
                >
                    <span aria-hidden="true">{isFiltersCollapsed ? "›" : "‹"}</span>
                </button>
            </div>

            <div className="flex-1 w-full">
                <h1 className='text-3xl w-full text-center font-bold mb-6'>{t('contest:contestsTableTitle')}</h1>
                <Table
                columns={columns}
                data={tableData}
                isLoading={isLoading}
                error={error}
                
                page={page}
                maxPage={maxPage}
                onPageChange={handlePageChange}
                
                sortField={sortField}
                sortOrder={sortOrder}
                onSortChange={handleSortChange}

                onRowClick={(contest) => window.open(`/etrx2/contest/${contest.contestId}`)}
                />
            </div>
        </div>
    );
}

export default function Page() {
  return (
    <Suspense fallback={<GizmoSpinner />}>
      <ContestClientPage />
    </Suspense>
  );
}
