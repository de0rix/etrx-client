export interface GetProblemsArgs {
  'Pagination.Page': number;
  'Pagination.PageSize': number;
  'Filters.AvailableTags'?: string[];
  'Filters.AvailableIndexes'?: string[];
  'Filters.AvailableDivisions'?: string[];
  'Filters.AvailableRanks'?: string[];
  'Filters.MinRating'?: number;
  'Filters.MaxRating'?: number;
  'Filters.MinPoints'?: number;
  'Filters.MaxPoints'?: number;
  'Filters.MinSolved'?: number;
  'Filters.MaxSolved'?: number;
  'Filters.MinDifficulty'?: number;
  'Filters.MaxDifficulty'?: number;
  'Sorting.SortField': string;
  'Sorting.SortOrder': string;
  ProblemName?: string;
  IsOnly: boolean;
  Lang: string;
}
