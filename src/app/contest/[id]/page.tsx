'use client';
import { useEffect, useState, useMemo, useRef, Suspense } from "react";
import { useParams } from "next/navigation";
import { useTranslation } from 'react-i18next';
import { useIsClient } from "@/hooks/useIsClient";
import { useQueryState } from "@/hooks/useQueryState";
import { getContest } from "@/app/services/contests";
import { getRanklistRows, GetRanklistRowsArgs, updateRanklistRows } from "@/app/services/ranklistRows";
import { Column, SortOrder } from "@/app/models/TableTypes";
import { Problem, RanklistRow, RanklistRowForTable } from "@/app/models/Ranklist";
import { Table } from "@/app/components/Table";
import { RadioGroup, Option } from "@/app/components/contest-radiogroup";
import GizmoSpinner from "@/app/components/gizmo-spinner";
import { useStopwatch } from "@/hooks/useStopwatch";
import { Contest } from "@/app/models/Contest";

const DEFAULT_PARTICIPANT_TYPE = 'CONTESTANT';
const DEFAULT_SORT_FIELD: keyof RanklistRow = 'points';
const DEFAULT_SORT_ORDER: SortOrder = 'desc';

function ContestIdClientPage() {
    const { t, i18n } = useTranslation();
    const contestId = Number(useParams().id);
    const isClient = useIsClient();
    
    const { searchParams, setQueryParams } = useQueryState({
        participantType: DEFAULT_PARTICIPANT_TYPE,
        sortField: DEFAULT_SORT_FIELD,
        sortOrder: DEFAULT_SORT_ORDER,
    });

    const participantType = useMemo(() => searchParams.get('participantType') || DEFAULT_PARTICIPANT_TYPE, [searchParams]);
    const sortField = useMemo(() => (searchParams.get('sortField') as keyof RanklistRow) || DEFAULT_SORT_FIELD, [searchParams]);
    const sortOrder = useMemo(() => (searchParams.get('sortOrder') as SortOrder) || DEFAULT_SORT_ORDER, [searchParams]);
    
    const [contest, setContest] = useState<Contest | null>(null);
    const [ranklistRows, setRanklistRows] = useState<RanklistRow[]>([]);
    const [problems, setProblems] = useState<Problem[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);
    const updatePerformed = useRef(false);

    const { elapsedTime: loadingTime, start: startStopwatch, stop: stopStopwatch, reset: resetStopwatch } = useStopwatch();

    useEffect(() => {
        if (!isClient) return;

        const fetchContest = async () => {
            try {
                const contestResponse = await getContest(contestId, i18n.language);
                if (!contestResponse.ok) throw new Error(t('common:error', { statusCode: contestResponse.status }));
                const contest: Contest = await contestResponse.json();
                setContest(contest);
            } catch (err) {
                setError(err as Error);
            }
        };

        fetchContest();
    }, [isClient, contestId, i18n.language, t]);

    useEffect(() => {
        if (!isClient || !contest) return;

        const fetchRanklist = async () => {
            setIsLoading(true);
            setError(null);
            resetStopwatch();
            startStopwatch();

            try {
                const shouldUpdate = !contest.isContestLoaded || participantType !== 'CONTESTANT';
                if (shouldUpdate && !updatePerformed.current) {
                    await updateRanklistRows(contestId, contest.source);
                    updatePerformed.current = true;
                }

                const args = new GetRanklistRowsArgs(
                    contestId,
                    sortField,
                    sortOrder === 'asc',
                    participantType,
                    i18n.language
                );
                const ranklistResponse = await getRanklistRows(args);
                if (!ranklistResponse.ok) throw new Error(t('common:error', { statusCode: ranklistResponse.status }));
                const ranklistData = await ranklistResponse.json();

                setRanklistRows(ranklistData.ranklistRows || []);
                setProblems(ranklistData.problems || []);
            } catch (err) {
                setError(err as Error);
                setRanklistRows([]);
                setProblems([]);
            } finally {
                setIsLoading(false);
                stopStopwatch();
            }
        };

        fetchRanklist();
    }, [isClient, contest, participantType, sortField, sortOrder, i18n.language, t, startStopwatch, stopStopwatch, resetStopwatch]);

    const handleSortChange = (newSortField: keyof RanklistRowForTable) => {
        const effectiveSortField = newSortField === 'id' ? 'handle' : newSortField;
        
        const newSortOrder = sortField === effectiveSortField && sortOrder === 'asc' ? 'desc' : 'asc';
        
        setQueryParams({
            sortField: effectiveSortField,
            sortOrder: newSortOrder
        });
    };

    const handleFilterChange = (newFilterValue: string) => {
        setQueryParams({ participantType: newFilterValue });
    };

    const columns: Column<RanklistRowForTable>[] = useMemo(() => {
        const staticColumns: Column<RanklistRowForTable>[] = [
            { key: 'username', header: t('contestId:tableHeaders.userName'), accessor: 'username' },
            { key: 'city', header: t('contestId:tableHeaders.city'), accessor: 'city' },
            { key: 'organization', header: t('contestId:tableHeaders.organization'), accessor: 'organization' },
            { key: 'grade', header: t('contestId:tableHeaders.class'), accessor: 'grade' },
            { key: 'points', header: t('contestId:tableHeaders.points'), accessor: 'points' },
            { key: 'solvedCount', header: t('contestId:tableHeaders.solvedCount'), accessor: 'solvedCount' },
        ];
    
        if (participantType === "ALL") {
            staticColumns.push({ key: 'participantType', header: t('contestId:tableHeaders.participantType'), accessor: 'participantType' });
        }
    
        const dynamicColumns: Column<RanklistRowForTable>[] = problems.map(problem => {
            const problemUrl = `https://codeforces.com/contest/${problem.contestId}/problem/${problem.index}`;
            return {
                key: problem.index, 
                header: (<a href={problemUrl} target="_blank" rel="noopener noreferrer">{problem.index}</a>),
                accessor: 'problemResults',
                isSortable: false, 
                render: (row) => {
                    const result = row.problemResults.find(pr => pr.index === problem.index);
                    if (!result) return '';
                    if (result.points > 0) return result.points === 1 ? '+' : result.points;
                    if (result.rejectedAttemptCount > 0) return `-${result.rejectedAttemptCount}`;
                    return '';
                },
            };
        });
    
        return [...staticColumns, ...dynamicColumns];
    }, [t, problems, participantType]);
    
    const tableData: RanklistRowForTable[] = ranklistRows.map((row, index) => ({ 
        ...row, 
        id: `${row.handle}-${index}`
    }));
    
    const participantFilterOptions: Option[] = [
        { label: t('contestId:filters.options.all'), value: 'ALL' },
        { label: t('contestId:filters.options.contestant'), value: 'CONTESTANT' },
        { label: t('contestId:filters.options.practice'), value: 'PRACTICE' },
        { label: t('contestId:filters.options.virtual'), value: 'VIRTUAL' },
        { label: t('contestId:filters.options.outOfCompetition'), value: 'OUT_OF_COMPETITION' },
    ];
    
    if (!isClient) {
        return <GizmoSpinner />;
    }
    
    return (
        <>
            <h1 className='text-3xl w-full text-center font-bold mb-5'>
                {contest ? t('contestId:contestTitle', { contestName: contest.name, contestId: contest.contestId }) : t('common:loading')}
            </h1>
            
            <RadioGroup
                title={t('contestId:filters.participation')}
                options={participantFilterOptions}
                name="participantTypeFilter"
                value={participantType}
                onChange={handleFilterChange}
            />
    
            <Table
                columns={columns}
                data={tableData}
                isLoading={isLoading}
                error={error}
                sortField={sortField}
                sortOrder={sortOrder}
                onSortChange={handleSortChange}
            />

            {loadingTime !== null && (
                <p className="text-center">
                    {t('common:loadingTime', { seconds: (loadingTime / 1000).toFixed(2) })}
                </p>
            )}
        </>
    );
}

export default function Page() {
  return (
    <Suspense fallback={<GizmoSpinner />}>
      <ContestIdClientPage />
    </Suspense>
  );
}
