// To inherit by any class that is used as arguments for
// request of sortable tables
export default class Sortable {
  constructor(
    sortField: string | null = null,
    sortOrder: boolean | null = false,
  ) {
    this.sortField = sortField;
    this.sortOrder = sortOrder;
  }

  sortField: string | null;
  sortOrder: boolean | null;
}
