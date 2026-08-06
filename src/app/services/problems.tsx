'use client';

import { GetProblemsArgs } from '../models/GetProblemsArgs';

function buildParams(args: Partial<GetProblemsArgs>): URLSearchParams {
  const params = new URLSearchParams();

  if (args['Pagination.Page'])
    params.append('Pagination.Page', args['Pagination.Page'].toString());
  if (args['Pagination.PageSize'])
    params.append(
      'Pagination.PageSize',
      args['Pagination.PageSize'].toString(),
    );

  args['Filters.AvailableTags']?.forEach((tag) =>
    params.append('Filters.AvailableTags', tag),
  );
  args['Filters.AvailableIndexes']?.forEach((idx) =>
    params.append('Filters.AvailableIndexes', idx),
  );
  args['Filters.AvailableDivisions']?.forEach((div) =>
    params.append('Filters.AvailableDivisions', div),
  );
  args['Filters.AvailableRanks']?.forEach((rank) =>
    params.append('Filters.AvailableRanks', rank),
  );

  const numFilters: (keyof GetProblemsArgs)[] = [
    'Filters.MinRating',
    'Filters.MaxRating',
    'Filters.MinPoints',
    'Filters.MaxPoints',
    'Filters.MinSolved',
    'Filters.MaxSolved',
    'Filters.MinDifficulty',
    'Filters.MaxDifficulty',
  ];

  numFilters.forEach((key) => {
    if (args[key] !== undefined && args[key] !== null) {
      params.append(key, args[key]!.toString());
    }
  });

  if (args['Sorting.SortField'])
    params.append('Sorting.SortField', args['Sorting.SortField']);
  if (args['Sorting.SortOrder'])
    params.append('Sorting.SortOrder', args['Sorting.SortOrder']);

  if (args.ProblemName) params.append('ProblemName', args.ProblemName);
  if (args.IsOnly !== undefined)
    params.append('IsOnly', args.IsOnly.toString());
  params.append('Lang', args.Lang || 'ru');

  return params;
}

export async function getProblems(args: GetProblemsArgs) {
  const params = buildParams(args);
  const url = `${process.env.NEXT_PUBLIC_API_URL}/api/Problems?${params.toString()}`;

  return await fetch(url, {
    method: 'GET',
    redirect: 'error',
  });
}

export async function getFilters(args: Partial<GetProblemsArgs> = {}) {
  const params = buildParams(args);
  const url = `${process.env.NEXT_PUBLIC_API_URL}/api/Problems/filters?${params.toString()}`;

  return await fetch(url, {
    method: 'GET',
    redirect: 'error',
  });
}
