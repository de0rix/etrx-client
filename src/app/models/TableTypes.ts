export type SortOrder = 'asc' | 'desc';

export interface Column<T> {
  key: string;
  header: React.ReactNode;
  accessor: keyof T;
  isSortable?: boolean;
  headerHint?: string;
  render?: (item: T) => React.ReactNode;
}

export interface TableProps<T> {
  data: T[];
  columns: Column<T>[];

  isLoading?: boolean;
  error?: Error | null;

  page?: number;
  maxPage?: number;
  onPageChange?: (newPage: number) => void;

  sortField?: keyof T | null;
  sortOrder?: SortOrder | null;
  onSortChange?: (newSortField: keyof T) => void;

  onRowClick?: (item: T) => void;
}
