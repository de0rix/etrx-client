'use client';

import { Entry, RequestProps, Table, TableEntry, TableProps } from "@/app/components/table";
import { getContestSubmissions, GetContestSubmissionsArgs, updateContestSubmissions } from "@/app/services/contests";
import { useParams } from "next/navigation";
import TableStyles from '../../components/table.module.css';
import { useMemo, useRef, useState } from "react";
import GizmoSpinner from "@/app/components/gizmo-spinner";

export default function Page()
{
    // Contest ID for which we request submissions.
    const contestId = Number(useParams().id);
    // Stores response status code, used for hiding the table, showing spinner
    // and possible error messages
    const [statusCode, setStatusCode] = useState(0);
    // Used to determine, if we need to POST an update to the server
    const [firstUpdate, setFirstUpdate] = useState(true);
    const tableProps = new TableProps(
        ['Хендл', 'Имя', 'Фамилия', 'Город', 'Организация', 'Класс', 'Всего решено', 'Тип участия']
    );

    async function getData(props: RequestProps)
    {  
        // Prepare request parameters and other properties
        props.page = null;
        props.maxPage = null;
        props.sortField = props.sortField ? props.sortField : 'solvedCount';
        props.sortOrder = props.sortOrder ? props.sortOrder : false;
        const args = new GetContestSubmissionsArgs(
            contestId,
            props.sortField,
            props.sortOrder
        );

        // Get raw data
        let response: Response;
        try
        {
            if(firstUpdate)
            {
                updateContestSubmissions(args).then(() => setFirstUpdate(false));
                response = await getContestSubmissions(args);
            }
            else
            {
                response = await getContestSubmissions(args);
            }
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
        let rawEntries = Array.from(data.submissions);
        // Remove array key
        rawEntries.splice(rawEntries.findIndex((fieldName) => fieldName == 'tries'), 1);

        // Create a list of problem indexes
        const problemIndexes: string[] = []
        data['problemIndexes'].forEach((elem: string) => {
            problemIndexes.push(elem);
        });

        // Set field keys that we got
        if(rawEntries[0])
        {
            props.fieldKeys = Object.keys(rawEntries[0]);
            // Remove array key
            props.fieldKeys.splice(props.fieldKeys.findIndex((fieldName) => fieldName == 'tries'), 1);
        }
            

        // Append problem indexes into table names
        tableProps.columnNames = 
            ['Хендл', 'Имя', 'Фамилия', 'Город', 'Организация', 'Класс', 'Всего решено', 'Тип участия'].concat(problemIndexes);
        
        // Create viewable content from raw data
        const entries: TableEntry[] = [];
        rawEntries.forEach((raw: any, i) => {
            const len = Object.keys(raw).length;
            const entry: Entry = new Entry();

            entry.cells = Array(len);
            Object.keys(raw).forEach((key, i) =>
            {
                if(key == 'tries')
                {
                    data['problemIndexes'].forEach((elem: string, index: number) => {
                        entry.cells.push(
                            <td key={i + index} className={TableStyles.cell}>{raw['tries'][index]}</td>
                        );     
                    });
                    return;
                }
                entry.cells.push(<td key={i} className={TableStyles.cell}>{raw[key]}</td>);
            });

            const tEntry = new TableEntry;
            tEntry.row = <tr key={i} className={TableStyles.tr}>
                {entry.cells}
            </tr>;
            entries.push(tEntry);
        });

        return {entries: entries, props: props};
    }

    const table = useMemo(() => {
        return (
            <>
            <div>
                <Table getData={getData} props={tableProps}></Table>
            </div>          
            </>
        )
        // Update the table after POST runs
    }, [firstUpdate])

    return(
        <>
        <h1 className=' text-3xl w-full text-center font-bold mb-5'>Таблица контеста #{contestId}</h1>
        {statusCode == 0 && <div className='mb-[150px]'><GizmoSpinner title="Загрузка кэшированных данных..."></GizmoSpinner></div>}
        {statusCode != 0 && firstUpdate && <div className='mb-[150px]'><GizmoSpinner timeout={40000} title="Обновление данных..."></GizmoSpinner></div>}
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