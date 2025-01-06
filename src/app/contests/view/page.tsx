"use client";
import { useEffect, useId, useMemo, useState } from "react";
import { GetContestsArgs, getContests } from "../../services/contests";
import TableStyles from '../../components/table.module.css';
import { Entry, TableEntry, Table, TableProps, RequestProps } from "@/app/components/table";
import GizmoSpinner from "@/app/components/gizmo-spinner";

export default function Page()
{
    const [statusCode, setStatusCode] = useState(0);
    const [gym, setGym] = useState<number>(2);
    const gymCheckbox = useId();

    useEffect(() => {
        const checkbox = document.getElementById(gymCheckbox) as HTMLInputElement;
        if(gym == 2)
            checkbox.indeterminate = true;
        else
            checkbox.indeterminate = false;
    }, [gym])

    async function getData(props: RequestProps)
    {  
        // Prepare request parameters and other properties
        props.page = props.page ? props.page : 1;
        props.sortField = props.sortField ? props.sortField : 'startTime';
        props.sortOrder = props.sortOrder ? props.sortOrder : false;
        const args = new GetContestsArgs(
            props.page,
            100,
            props.sortField,
            props.sortOrder,
            gym == 2? null : gym == 1? true : false,
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

        // Set status code to track request state
        setStatusCode(response.status);

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
            onClick={() => window.open(`/contests/${raw['contestId']}`)}>
                {entry.cells}
            </tr>;
            entries.push(tEntry);
        });

        return {entries: entries, props: props};
    }

    const tableProps = new TableProps( 
        ['ID', 'Название', 'Время начала']
    );

    const table = useMemo(() => {
        return (
            <>
            <div>
                <Table getData={getData} props={tableProps}></Table>
            </div>          
            </>
        )
    }, [gym])

    return(
        <>
        <h1 className='text-3xl w-full text-center font-bold mb-5'>Таблица контестов</h1>
        <div className='m-auto rounded-md h-fit px-4 py-2 lg:w-[200px] w-[140px] bg-background-shade'>
            <div>Фильтры</div>
            <form>
                <div className='flex items-center'>
                    <input 
                    className='w-4 h-4 mb-1'
                    id={gymCheckbox}
                    type="checkbox"
                    name="gymCheckbox"
                    checked={gym == 1 ? true : false}
                    onChange={(event) => {
                        const checkbox = event.target;
                        if(checkbox.checked && gym == 2)
                            setGym(0);
                        else
                            setGym(gym + 1);
                    }}
                    />
                    <div className='ml-2'>Тренировки</div>
                </div>
            </form>
        </div>
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