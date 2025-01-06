"use client";

import { getUsers, GetUsersArgs } from "@/app/services/users";
import { Entry, RequestProps, Table, TableEntry, TableProps } from "@/app/components/table";
import { useMemo, useState } from "react";
import TableStyles from '../../components/table.module.css';
import GizmoSpinner from "@/app/components/gizmo-spinner";

export default function Page()
{
    const [statusCode, setStatusCode] = useState(0);
    async function getData(props: RequestProps)
    {
        // Prepare request parameters
        props.sortField = props.sortField ? props.sortField : 'firstName';
        props.sortOrder = props.sortOrder ? props.sortOrder : true;
        const args = new GetUsersArgs(
            null,
            null,
            props.sortField,
            props.sortOrder
        )
        // Get raw data
        let response: Response;
        try
        {
            response = await getUsers(args);
        } 
        catch(error)
        {
            setStatusCode(-1);
            return {entries: [], props: props};
        }

        // Set status code to track request state
        setStatusCode(response.status);
        if(response.status != 200)
            return {entries: [], props: props};
        
        const data = await response.json();
        const rawEntries = Array.from(data.users);

        // Set field keys that we got
        if(rawEntries[0])
            props.fieldKeys = Object.keys(rawEntries[0]);
        
        // Create viewable content from raw data
        const entries: TableEntry[] = [];
        rawEntries.forEach((raw: any, i) => {
            const len = Object.keys(raw).length;
            const entry: Entry = new Entry();

            entry.cells = Array(len);
            Object.keys(raw).forEach((key, i) =>
            {
                entry.cells.push(<td key={i} className={TableStyles.cell}>{raw[key]}</td>);
            });

            const tEntry = new TableEntry;
            tEntry.row = <tr key={i} className={TableStyles.tr_link}
            onClick={() => window.open(`https://codeforces.com/profile/${raw['handle']}`)}>
                {entry.cells}
            </tr>;
            entries.push(tEntry);
        });

        return {entries: entries, props: props};
    }

    const tableProps = new TableProps(
        ['ID', 'Хендл', 'Имя', 'Фамилия', 'Организация', 'Город', 'Класс']
    );

    const table = useMemo(() => {
        return (
            <>
            <div>
                <Table getData={getData} props={tableProps}></Table>
            </div>          
            </>
        )
    }, [])

    return(
        <>
        <h1 className=' text-3xl w-full text-center font-bold mb-5'>Таблица пользователей</h1>
        {statusCode == 0 && <div className='mb-[150px]'><GizmoSpinner></GizmoSpinner></div>}
        {statusCode != 200 && statusCode != 0 && 
            <h1 className="w-full text-center text-2xl font-bold">
                Не получилось загрузить данные таблицы. Статус код: {statusCode}
            </h1>
        }
        <div className={statusCode == 200 ? 'visible' : 'invisible'}>
            {table}
        </div>
        </>
    );
}