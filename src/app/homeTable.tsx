'use client';
import { useState } from "react";
import { Entry, RequestProps, Table, TableEntry, TableProps } from "./components/table";
import { getContests, GetContestsArgs } from "./services/contests";
import TableStyles from './components/table.module.css';

export default function HomeTable()
{
    const [statusCode, setStatusCode] = useState(0);

    async function getData(props: RequestProps)
    {   
        // Prepare request parameters and other properties
        props.page = props.page ? props.page : 1;
        props.sortField = props.sortField ? props.sortField : 'startTime';
        props.sortOrder = props.sortOrder ? props.sortOrder : false;
        const args = new GetContestsArgs(
            props.page,
            10,
            props.sortField,
            props.sortOrder,
            null
        )

        // Get raw data
        let response: Response;
        try
        {
            response = await getContests(args);
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
        const rawEntries = Array.from(data.contests);

        // Set new page that we got from response
        if(data['pageCount'] && typeof(data['pageCount']) == 'number')
            props.maxPage = data['pageCount'];

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
                if(key == 'startTime')
                    entry.cells.push(
                        <td key={i} className={TableStyles.cell}>
                            {(new Date(raw[key] as number * 1000)).toLocaleString('ru', 
                                {
                                    minute: '2-digit',
                                    hour: '2-digit',
                                    day: 'numeric',
                                    month: 'numeric',
                                    year: 'numeric',
                                    weekday: 'long'
                                }
                            )}
                        </td>
                    );
                else
                    entry.cells.push(
                        <td key={i} className={TableStyles.cell}>
                            {raw[key]}
                        </td>
                    );
            });

            const tEntry = new TableEntry;
            tEntry.row = <tr key={i} className={TableStyles.tr_link}
            onClick={() => window.open(`/etrx2/contests/${raw['contestId']}`)}>
                {entry.cells}
            </tr>;
            entries.push(tEntry);
        });

        return {entries: entries, props: props};
    }

    function contestTable()
    {
        const tableProps = new TableProps(
            ['ID', 'Название', 'Время начала']
        );
        tableProps.hidePageSelectors = true;

        // Display table and hide it if status code is not 200
        return(
            <>
            {statusCode != 200 && statusCode != 0 && 
                <h1 className="w-full text-center text-2xl font-bold">
                    Не получилось загрузить данные таблицы. Статус код: {statusCode}
                </h1>
            }
            <div className={statusCode == 200 ? 'visible' : 'invisible'}>
                <Table getData={getData} props={tableProps}></Table>
            </div>
            </>            
        );
    }

    return(
        <>
        {contestTable()}
        </>
    )
}