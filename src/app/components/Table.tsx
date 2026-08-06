import React from 'react';
import Styles from './network-table.module.css';
import PageSelector from './page-selector';
import GizmoSpinner from './gizmo-spinner';
import { SortOrder, TableProps } from '@/app/models/TableTypes';

const getSortClasses = (
  isSorted: boolean,
  sortOrder: SortOrder | null | undefined,
): string => {
  if (!isSorted) return '';
  return sortOrder === 'desc' ? Styles.cell_arrow_down : Styles.cell_arrow_up;
};

export function Table<T extends { id: string | number }>({
  data,
  columns,
  isLoading = false,
  error = null,
  page,
  maxPage,
  onPageChange,
  sortField,
  sortOrder,
  onSortChange,
  onRowClick,
}: TableProps<T>) {
  const tableHeaders = (
    <thead>
      <tr>
        {columns.map((column) => {
          const sortable = column.isSortable ?? true;
          const isSorted = sortable && column.accessor === sortField;

          const classes = `${Styles.th} ${sortable ? Styles.sortable : ''} ${getSortClasses(isSorted, sortOrder)}`;

          return (
            <th
              key={column.key}
              className={classes}
              onClick={() => sortable && onSortChange?.(column.accessor)}
              title={column.headerHint}
            >
              {column.header}
            </th>
          );
        })}
      </tr>
    </thead>
  );

  const tableBody = (
    <tbody>
      {data.map((item) => (
        <tr
          key={item.id}
          className={onRowClick ? Styles.tr_link : ''}
          onClick={() => onRowClick?.(item)}
        >
          {columns.map((column) => (
            <td key={String(column.key)} className={Styles.cell}>
              {column.render
                ? column.render(item)
                : (item[column.accessor] as React.ReactNode)}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );

  const renderContent = () => {
    if (error) {
      return (
        <div className="text-center py-10 text-red-500">
          Ошибка: {error.message}
        </div>
      );
    }

    if (data.length === 0) {
      return (
        <div className="text-center py-10">Нет данных для отображения</div>
      );
    }

    return (
      <table className={Styles.table}>
        {tableHeaders}
        {tableBody}
      </table>
    );
  };

  const showPagination =
    !isLoading && data.length > 0 && page && maxPage && onPageChange;

  if (isLoading) {
    return (
      <div className="py-10">
        <GizmoSpinner />
      </div>
    );
  } else {
    return (
      <div className={Styles.container}>
        {showPagination && (
          <PageSelector
            page={page}
            maxPage={maxPage}
            pageCallback={onPageChange}
          />
        )}
        {renderContent()}
        {showPagination && (
          <PageSelector
            page={page}
            maxPage={maxPage}
            pageCallback={onPageChange}
          />
        )}
      </div>
    );
  }
}
