'use client';

import Pageable from "../models/Pageable";

export class GetProblemsArgs extends Pageable
{
    constructor(
        page: number,
        pageSize: number | null = null,
        sortField: string | null = null,
        sortOrder: boolean | null = false,
        public tags: string = ''
    ) 
    {
        super(page, pageSize, sortField, sortOrder);
    }
}

export async function getProblems(args: GetProblemsArgs)
{
    return await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/Problems/GetProblemsByPageWithSortAndFilterTags?` +
        `page=${args.page}` + 
        `${args.pageSize != null? `&pageSize=${args.pageSize}` : '&pageSize=20'}` + 
        `${args.sortField != null? `&sortField=${args.sortField}` : ''}` + 
        `${args.sortOrder != null? `&sortOrder=${args.sortOrder}` : '&sortOrder=false'}` +
        `${args.tags != ''? `&tags=${args.tags}` : ''}`,
        {
            redirect: 'error'
        }
    );
}