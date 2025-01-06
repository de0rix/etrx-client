import Sortable from "./Sortable";

export default class Pageable extends Sortable
{
    constructor(
        public page: number,
        public pageSize: number | null = null,
        sortField: string | null = null,
        sortOrder: boolean | null = false
    )
    {
        super(sortField, sortOrder);
    }
}