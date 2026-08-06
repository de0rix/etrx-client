'use client';

import {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
  Suspense,
} from 'react';
import { useTranslation } from 'react-i18next';
import { useIsClient } from '@/hooks/useIsClient';
import { useQueryState } from '@/hooks/useQueryState';
import GizmoSpinner from '@/app/components/gizmo-spinner';
import { Table } from '@/app/components/Table';
import { GetDivTagsList } from '@/app/components/problem-tags';
import { Column, SortOrder } from '@/app/models/TableTypes';
import { Problem, ProblemForTable } from '@/app/models/Problem';
import { unixToFormattedDate } from '@/libs/date';
import { FilterBounds } from '../models/FilterBounds';
import FilterSidebar from '../components/filter-sidebar';
import { getFilters, getProblems } from '../services/problems';

function ProblemClientPage() {
  const { t, i18n } = useTranslation(['problem', 'common', 'contest']);
  const isClient = useIsClient();
  const isMounted = useRef(true);
  const boundsInitialized = useRef(false);
  const lastFetchKey = useRef<string | null>(null);

  const [totalBounds, setTotalBounds] = useState<FilterBounds | null>(null);
  const [currentBounds, setCurrentBounds] = useState<FilterBounds | null>(null);

  const [problems, setProblems] = useState<Problem[]>([]);
  const [maxPage, setMaxPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [isFiltersCollapsed, setIsFiltersCollapsed] = useState(false);

  const { searchParams, setQueryParams } = useQueryState({
    page: 1,
    sortField: 'contestId',
    sortOrder: 'desc',
    isOnly: 'true',
  });

  const filters = useMemo(() => {
    const getNum = (key: string) => {
      const val = searchParams.get(key);
      return val !== null && val !== '' ? Number(val) : undefined;
    };
    const getArray = (key: string) => {
      const val = searchParams.get(key);
      return val ? val.split(',').filter(Boolean) : [];
    };

    return {
      page: Number(searchParams.get('page')) || 1,
      sortField: (searchParams.get('sortField') ||
        'contestId') as keyof Problem,
      sortOrder: (searchParams.get('sortOrder') || 'desc') as SortOrder,
      problemName: searchParams.get('problemName') || '',
      isOnly: searchParams.get('isOnly') !== 'false',
      minRating: getNum('minRating'),
      maxRating: getNum('maxRating'),
      minPoints: getNum('minPoints'),
      maxPoints: getNum('maxPoints'),
      minSolved: getNum('minSolved'),
      maxSolved: getNum('maxSolved'),
      minDifficulty: getNum('minDifficulty'),
      maxDifficulty: getNum('maxDifficulty'),
      tags: getArray('tags'),
      indexes: getArray('indexes'),
      ranks: getArray('ranks'),
      divisions: getArray('divisions'),
    };
  }, [searchParams]);

  useEffect(() => {
    const initBounds = async () => {
      try {
        const response = await getFilters({});
        if (response.ok) {
          const data = await response.json();
          const bounds = data.totalBounds;

          setTotalBounds(bounds);
          setCurrentBounds(data.currentFilters);

          const paramsToUpdate: any = {};
          const keys = [
            'minRating',
            'maxRating',
            'minPoints',
            'maxPoints',
            'minSolved',
            'maxSolved',
            'minDifficulty',
            'maxDifficulty',
          ];

          keys.forEach((key) => {
            if (
              searchParams.get(key) === null &&
              (bounds as any)[key] !== undefined
            ) {
              paramsToUpdate[key] = (bounds as any)[key];
            }
          });

          if (Object.keys(paramsToUpdate).length > 0) {
            setQueryParams(paramsToUpdate);
          }
        }
      } catch (err) {
        console.error('Failed to load metadata:', err);
      }
    };
    if (isClient && !boundsInitialized.current) {
      boundsInitialized.current = true;
      initBounds();
    }
  }, [isClient, searchParams, setQueryParams]);

  const fetchProblems = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const queryArgs: any = {
      'Pagination.Page': filters.page,
      'Pagination.PageSize': 100,
      'Filters.AvailableTags': filters.tags,
      'Filters.AvailableIndexes': filters.indexes,
      'Filters.AvailableDivisions': filters.divisions,
      'Filters.AvailableRanks': filters.ranks,
      'Filters.MinRating': filters.minRating,
      'Filters.MaxRating': filters.maxRating,
      'Filters.MinPoints': filters.minPoints,
      'Filters.MaxPoints': filters.maxPoints,
      'Filters.MinSolved': filters.minSolved,
      'Filters.MaxSolved': filters.maxSolved,
      'Filters.MinDifficulty': filters.minDifficulty,
      'Filters.MaxDifficulty': filters.maxDifficulty,
      'Sorting.SortField': filters.sortField,
      'Sorting.SortOrder': filters.sortOrder,
      ProblemName: filters.problemName || undefined,
      IsOnly: filters.isOnly,
      Lang: i18n.language,
    };

    try {
      const [resProblems, resFilters] = await Promise.all([
        getProblems(queryArgs),
        getFilters(queryArgs),
      ]);

      if (!isMounted.current) return;
      if (!resProblems.ok)
        throw new Error(t('common:error', { statusCode: resProblems.status }));

      const dataP = await resProblems.json();
      const dataF = await resFilters.json();

      setProblems(dataP.items || dataP.problems || []);
      setMaxPage(dataP.totalPagesCount || dataP.pageCount || 1);

      if (dataF.currentFilters) {
        setCurrentBounds(dataF.currentFilters);
      }
    } catch (err) {
      if (isMounted.current) setError(err as Error);
    } finally {
      if (isMounted.current) setIsLoading(false);
    }
  }, [filters, i18n.language, t]);

  const hasTotalBounds = totalBounds !== null;

  useEffect(() => {
    isMounted.current = true;
    const fetchKey = JSON.stringify([filters, i18n.language]);
    if (isClient && hasTotalBounds && lastFetchKey.current !== fetchKey) {
      lastFetchKey.current = fetchKey;
      fetchProblems();
    }
    return () => {
      isMounted.current = false;
    };
  }, [isClient, fetchProblems, hasTotalBounds, filters, i18n.language]);

  const handleSortChange = (newSortField: keyof ProblemForTable) => {
    const isAsc =
      filters.sortField === newSortField && filters.sortOrder === 'asc';
    setQueryParams({
      sortField: newSortField as string,
      sortOrder: isAsc ? 'desc' : 'asc',
      page: 1,
    });
  };

  const columns: Column<ProblemForTable>[] = useMemo(
    () => [
      {
        key: 'contestId',
        header: t('problem:tableHeaders.contest'),
        accessor: 'contestId',
      },
      {
        key: 'index',
        header: t('problem:tableHeaders.index'),
        accessor: 'index',
      },
      { key: 'name', header: t('problem:tableHeaders.name'), accessor: 'name' },
      {
        key: 'points',
        header: t('problem:tableHeaders.points'),
        accessor: 'points',
      },
      {
        key: 'rating',
        header: t('problem:tableHeaders.rating'),
        accessor: 'rating',
      },
      {
        key: 'difficulty',
        header: t('problem:tableHeaders.difficulty'),
        accessor: 'difficulty',
      },
      {
        key: 'solvedCount',
        header: t('problem:tableHeaders.solvedCount'),
        accessor: 'solvedCount',
      },
      {
        key: 'startTime',
        header: t('contest:tableHeaders.startTime'),
        accessor: 'startTime',
        render: (item) => unixToFormattedDate(item.startTime, t),
      },
      {
        key: 'rank',
        header: t('problem:tableHeaders.rank'),
        accessor: 'rank',
        isSortable: false,
      },
      {
        key: 'division',
        header: t('problem:tableHeaders.division'),
        accessor: 'division',
        isSortable: false,
      },
      {
        key: 'tags',
        header: t('problem:tableHeaders.tags'),
        accessor: 'tags',
        render: (p) => GetDivTagsList(p.tags),
        isSortable: false,
      },
    ],
    [t],
  );

  if (!isClient || !totalBounds || !currentBounds) {
    return <GizmoSpinner />;
  }

  return (
    <>
      <div className="flex flex-col md:flex-row gap-8 items-start mt-6">
        <div
          className={`filterSidebarShell ${isFiltersCollapsed ? 'filterSidebarShellCollapsed' : ''}`}
        >
          <FilterSidebar
            totalBounds={totalBounds}
            currentBounds={currentBounds}
            initialFilters={filters}
            onApply={(res) => {
              setQueryParams({
                ...res,
                tags: res.tags.length > 0 ? res.tags.join(',') : undefined,
                indexes:
                  res.indexes.length > 0 ? res.indexes.join(',') : undefined,
                divisions:
                  res.divisions.length > 0
                    ? res.divisions.join(',')
                    : undefined,
                ranks: res.ranks.length > 0 ? res.ranks.join(',') : undefined,
                page: 1,
              });
            }}
          />
          <button
            type="button"
            className="filterSidebarToggle"
            aria-label={
              isFiltersCollapsed ? 'Показать фильтры' : 'Скрыть фильтры'
            }
            aria-expanded={!isFiltersCollapsed}
            onClick={() => setIsFiltersCollapsed((collapsed) => !collapsed)}
          >
            <span aria-hidden="true">{isFiltersCollapsed ? '›' : '‹'}</span>
          </button>
        </div>

        <div className="flex-1 w-full">
          <h1 className="text-3xl w-full text-center font-bold mb-6">
            {t('problem:problemsTableTitle')}
          </h1>
          <Table
            columns={columns}
            data={problems.map((p) => ({
              ...p,
              id: `${p.contestId}-${p.index}`,
            }))}
            isLoading={isLoading}
            error={error}
            page={filters.page}
            maxPage={maxPage}
            onPageChange={(p) => setQueryParams({ page: p })}
            sortField={filters.sortField as keyof ProblemForTable}
            sortOrder={filters.sortOrder as SortOrder}
            onSortChange={handleSortChange}
            onRowClick={(p) =>
              window.open(
                `https://codeforces.com/problemset/problem/${p.contestId}/${p.index}`,
              )
            }
          />
        </div>
      </div>
    </>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<GizmoSpinner />}>
      <ProblemClientPage />
    </Suspense>
  );
}
