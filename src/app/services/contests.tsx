'use client';

import Pageable from "../models/Pageable";
import Sortable from "../models/Sortable";

export async function updateContests()
{
    return await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/Codeforces/Contests/PostAndUpdateContestsFromCodeforces?`,
        {
            redirect: 'error',   
            method: 'POST',  
        }
    ); 
}

export async function getContestsPageCount (
    recordsPerPage: number
)
{
    let num: number | null = null;
    try {
        await fetch(`http://${process.env.NEXT_PUBLIC_API_URL}/api/Contests/GetCountOfPagesContests?pageCount=${recordsPerPage}`,
            {
                redirect: 'error',                
            }).then(res => res.text()).then(res => num = Number(res));
        return num;
    } catch(_) {
        return num;
    }
}

export class GetContestsArgs extends Pageable
{
    constructor(
        page: number,
        pageSize: number | null = null,
        sortField: string | null = null,
        sortOrder: boolean | null = false,
        isGym: boolean | null = null,
    ) 
    {
        super(page, pageSize, sortField, sortOrder);
        this.isGym = isGym;
    }

    isGym: boolean | null;
}

export async function getContests(
    args: GetContestsArgs
) 
{
    return fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/Contests/GetContestsByPageWithSort?` +
        `page=${args.page}` + 
        `${args.pageSize != null? `&pageSize=${args.pageSize}` : '&pageSize=20'}` + 
        `${args.isGym != null? `&gym=${args.isGym}` : ''}` + 
        `${args.sortField != null? `&sortField=${args.sortField}` : ''}` + 
        `${args.sortOrder != null? `&sortOrder=${args.sortOrder}` : '&sortOrder=false'}`,
        {redirect: 'error'});
}

export class GetContestSubmissionsArgs extends Sortable
{
    constructor(
        public contestId: number,
        public sortField: string | null,
        public sortOrder: boolean | null
    )
    {
        super(sortField, sortOrder);
    }
}

export async function getContestSubmissions(args: GetContestSubmissionsArgs)
{
    return await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/Submissions/GetSubmissionsByContestIdWithSort?` +
        `contestId=${args.contestId}` +
        `${args.sortField != null? `&sortField=${args.sortField}` : ''}` +
        `${args.sortOrder != null? `&sortOrder=${args.sortOrder}` : ''}`,
        {
            redirect: 'error',     
        }); 
}

export async function updateContestSubmissions(args: GetContestSubmissionsArgs)
{
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/Codeforces/Submissions/PostAndUpdateSubmissionsFromCodeforcesByContestId?` +
        `contestId=${args.contestId}`,
        {
            redirect: 'error',   
            method: 'POST',  
        }); 
    return;
}