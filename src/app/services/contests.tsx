'use client';

import Pageable from "../models/Pageable";
import Sortable from "../models/Sortable";

// TODO: POST to update backend contests table

export class GetContestsArgs extends Pageable
{
    constructor(
        page: number,
        pageSize: number | null = null,
        sortField: string | null = null,
        sortOrder: boolean | null = false,
        isGym: boolean | null = null,
        source: string | null = null,
        contestId: number | null = null,
        lang: string | null = null
    ) 
    {
        super(page, pageSize, sortField, sortOrder);
        this.isGym = isGym;
        this.source = source;
        this.contestId = contestId;
        this.lang = lang;
    }

    isGym: boolean | null;
    source: string | null;
    contestId: number | null;
    lang: string | null;
}

export async function getContests(
    args: GetContestsArgs
) 
{
    return fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/Contests?` +
        `page=${args.page}` + 
        `${args.pageSize != null? `&pageSize=${args.pageSize}` : '&pageSize=20'}` + 
        `${args.isGym != null? `&gym=${args.isGym}` : ''}` +
        `${args.source != null? `&source=${encodeURIComponent(args.source)}` : ''}` +
        `${args.contestId != null? `&ContestId=${args.contestId}` : ''}` +
        `${args.sortField != null? `&sortField=${args.sortField}` : ''}` + 
        `${args.sortOrder != null? `&sortOrder=${args.sortOrder}` : '&sortOrder=false'}` + 
        `${args.lang != null? `&lang=${args.lang}` : '&lang=ru'}`,
        {redirect: 'error'});
}

export class GetContestSubmissionsArgs extends Sortable
{
    constructor(
        public contestId: number,
        public sortField: string | null,
        public sortOrder: boolean | null,
        public filterByParticipantType: string | null,
        public lang: string | null
    )
    {
        super(sortField, sortOrder);
        this.filterByParticipantType = filterByParticipantType;
        this.lang = lang;
    }
}

export async function getContestSubmissions(args: GetContestSubmissionsArgs)
{
    return await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/Submissions/${args.contestId}?` +
        `${args.sortField != null? `&sortField=${args.sortField}` : ''}` +
        `${args.filterByParticipantType != null? `&filterByParticipantType=${args.filterByParticipantType}` : ''}` +
        `${args.sortOrder != null? `&sortOrder=${args.sortOrder}` : ''}` +
        `${args.lang != null? `&lang=${args.lang}` : 'lang=ru'}`,
        {
            redirect: 'error',     
        }); 
}

export async function updateContestSubmissions(contestId: number)
{
    return await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/Codeforces/Submissions/${contestId}?`,
        {
            redirect: 'error',   
            method: 'POST',  
        }); 
}

export async function getContest(contestId: number, lang: string | null)
{
    return await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/Contests/${contestId}?` +
        `${lang != null? `&lang=${lang}` : 'lang=ru'}`,
        {
            redirect: 'error',   
            method: 'GET',  
        }); 
}