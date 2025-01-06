'use client';

import Pageable from "../models/Pageable";

export async function updateUsers()
{
    return await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/Codeforces/Users/PostAndUpdateUsersFromDlCodeforces?`,
        {
            redirect: 'error',   
            method: 'POST',  
        }
    );
}

// While it does not utilize any paging, should have params for it for the future...
export class GetUsersArgs
{
    constructor(
        public page: number | null = null,
        public pageSize: number | null = null,
        public sortField: string | null = null,
        public sortOrder: boolean | null = false
    ) {}
}

export async function getUsers(
    args: GetUsersArgs
) 
{
    return await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/Users/GetUsersWithSort?` +
        `${args.sortField != null? `&sortField=${args.sortField}` : ''}` + 
        `${args.sortOrder != null? `&sortOrder=${args.sortOrder}` : '&sortOrder=false'}`,
        {
            redirect: 'error',                
        });
}