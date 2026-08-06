import Sortable from './Sortable';

export default class Pageable extends Sortable {
  constructor(
    page: number,
    pageSize: number | null = null,
    sortField: string | null = null,
    sortOrder: boolean | null = false,
  ) {
    super(sortField, sortOrder);
    this.page = page;
    this.pageSize = pageSize;
  }

  page: number;
  pageSize: number | null = null;
}
