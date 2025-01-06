
// To inherit by any class that is used as arguments for
// request of sortable tables
export default class Sortable
{
    constructor(
        public sortField: string | null = null, 
        public sortOrder: boolean | null = false
    ) {}
}