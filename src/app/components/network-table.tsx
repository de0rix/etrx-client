import Styles from './network-table.module.css';

import PageSelector from './page-selector';
import { useCallback, useEffect, useState } from 'react';
import GizmoSpinner from './gizmo-spinner';
import { usePathname, useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';

export class NetTableParams {
  constructor(
    page: number,
    pageSize: number | null,
    sortField: string | null,
    sortOrder: boolean | null,
  ) {
    this.page = page;
    this.pageSize = pageSize;
    this.sortField = sortField;
    this.sortOrder = sortOrder;
  }

  page: number;
  pageSize: number | null;
  sortField: string | null;
  sortOrder: boolean | null;
}

type NTMiscProps = {
  children?: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
  href?: string;
};

// Type of the parameter that will be used to create link.
// Appended: a single parameter will be appended to the end of the link
// and will be a literal link section
// Arguments: multiple arguments will be added to a link using different
// names and field values from a map
export enum LinkParamType {
  Appended,
  Arguments,
}

// All of the arguments that may be needed to use NetTable
//
export type TableProps = {
  // Function that will be used to get data for a table to display.
  // params - additional parameters for a query, should be used
  getData: (params: NetTableParams) => Promise<any>;

  // Table head titles/text. That's it.
  headTitles: string[];

  // Key of a field that contains data in the request
  dataField: string;

  // Disables sorting completely, duh.
  disableSorting?: boolean;

  // Raw link without any arguments
  link?: string;

  // Specifies how parameters will be inserted into the link
  // Appended: value from field with name from linkAppendedParamField
  //   will be appended to the end of the link as a segment i.e. .../value
  // Arguments: values from the linkArgs will be link arguments' values,
  //   while keys of those values will be arguments' names
  paramType?: LinkParamType;

  // Map for all static arguments you want to add to the link
  // Key: argument name
  // Value: argument value
  linkArgs?: Map<string, any>;

  // Map of dynamic link arguments
  // Key: argument name
  // Value: field name, which value will be inserted as argument value
  // Specify only when paramType is set to Arguments
  linkDynamicArgs?: Map<string, string>;

  // Name of a field which value will be appended to the end of the link
  // when paramType is set to Appended
  linkAppendedParamField?: string;
};

export function NTrow({ children, onClick, href }: NTMiscProps) {
  if (href)
    return (
      <tr
        className={Styles.tr_link}
        onClick={(e) => {
          window.open(href);
          onClick ? onClick(e) : '';
        }}
      >
        {children}
      </tr>
    );
  else return <tr onClick={onClick}>{children}</tr>;
}

export function NTcell({ children, onClick }: NTMiscProps) {
  return (
    <td className={Styles.cell} onClick={onClick}>
      {children}
    </td>
  );
}

export function NetTable({ props }: { props: TableProps }) {
  const pageSize = 100;
  const pageCountJsonKey = 'pageCount';
  const sortableFieldsJsonKey = 'properties';

  const [data, setData] = useState<any>(null);
  const [pageCount, setPageCount] = useState<number | null>(1);
  const [sortableFields, setSortableFields] = useState(new Array<string>());
  const [message, setMessage] = useState('');

  const searchParams = useSearchParams();
  const current = new URLSearchParams(Array.from(searchParams.entries()));
  const currPage = current.get('p');
  const firstPage = currPage ? Number(currPage) : 1;
  const [params, setParams] = useState(
    new NetTableParams(firstPage, pageSize, null, null),
  );

  const pathname = usePathname();
  const { replace } = useRouter();

  const request = useCallback(() => {
    props.getData(params).then((res) => {
      if (res['message']) {
        setMessage(res['message']);
        return;
      }

      if (props.dataField !== '') {
        if (res[props.dataField]) setData(res[props.dataField]);
        else console.error(`There is no value behind props.dataField key!`);
      } else {
        setData(res);
        console.warn(
          'No props.dataField was specified, parsing whole JSON as initial data.',
        );
      }

      if (!res) console.warn('JSON value is either null or undefined.');

      // Checks if there is any page count specified in the JSON.
      // If not, assume no paging is available
      if (res[pageCountJsonKey]) setPageCount(res[pageCountJsonKey]);
      else setPageCount(null);

      if (props.disableSorting == true) setSortableFields([]);
      else {
        // Checks if there any sortable fields names given, if not
        // try to use data entries fields.
        if (res[sortableFieldsJsonKey])
          setSortableFields(res[sortableFieldsJsonKey]);
        else setSortableFields(Object.keys(res[0]));
      }
    });
  }, [props, params]);

  useEffect(() => {
    request();
  }, [request]);

  function pageCallback(page: number) {
    const newParams = new NetTableParams(
      page,
      params.pageSize,
      params.sortField,
      params.sortOrder,
    );
    setParams(newParams);

    current.set('p', page.toString());
    replace(`${pathname}?${current.toString()}`);
  }

  function changeParams(fieldName: string | undefined) {
    if (fieldName) {
      const newParams = new NetTableParams(
        params.page,
        params.pageSize,
        fieldName,
        fieldName !== params.sortField ? false : !params.sortOrder,
      );
      setParams(newParams);
    }
  }

  // Produces a link for a single row. Takes record (i.e. whole table row data)
  // as input
  function processLink(record: any) {
    if (!props.link) return undefined;

    if (props.paramType == LinkParamType.Appended) {
      // Throw error if name of the field which value will be used is not provided
      if (!props.linkAppendedParamField) {
        console.error(
          'Parameter linkAppendedParamField was not set, but is used with current LinkParamType!',
        );
        return undefined;
      }
      // Throw error if there is no field with provided name in record
      if (!record[props.linkAppendedParamField]) {
        console.error(
          'There is no field in record named as string provided by linkAppendedParamField!',
        );
        return undefined;
      }

      if (props.link.endsWith('/'))
        return props.link + record[props.linkAppendedParamField];
      else return props.link + '/' + record[props.linkAppendedParamField];
    }

    return undefined;
  }

  if (message === 'Fetch failed')
    return (
      <h1 className="text-center text-lg mt-5 mb-5">
        Sorry, remote data is not available. <br />
        Check your connection.
      </h1>
    );

  if (!data)
    return (
      <div className="h-40 w-svw">
        <GizmoSpinner></GizmoSpinner>
      </div>
    );
  // Handle empty case
  if (data.length == 0)
    return (
      <h1 className="text-center text-lg mt-5 mb-5">
        Table appears to be empty.
      </h1>
    );

  // All fields should be the same, or else...
  if (!data[0])
    return (
      <h1 className="text-center text-lg mt-5 mb-5">
        Table appears to be ill-formed.
      </h1>
    );

  const allFieldNames = Object.keys(data[0]);

  return (
    <>
      {pageCount && (
        <PageSelector
          page={params.page}
          maxPage={pageCount}
          pageCallback={pageCallback}
        />
      )}
      <div className={Styles.container}>
        <table className={Styles.table}>
          <thead>
            <tr key={0}>
              {allFieldNames.map((fieldName, index) => {
                if (!sortableFields || !sortableFields.at(index) || !params)
                  return (
                    <th key={index} className={Styles.th}>
                      {props.headTitles.at(index)
                        ? props.headTitles.at(index)
                        : fieldName}
                    </th>
                  );

                if (
                  !params.sortField ||
                  sortableFields.at(index)!.toLowerCase() !==
                    params.sortField!.toLowerCase()
                )
                  return (
                    <th
                      key={index}
                      className={Styles.th}
                      onClick={() => changeParams(allFieldNames.at(index))}
                    >
                      {props.headTitles.at(index)
                        ? props.headTitles.at(index)
                        : fieldName}
                    </th>
                  );

                if (params.sortOrder)
                  return (
                    <th
                      key={index}
                      className={[Styles.th, Styles.cell_arrow_up].join(' ')}
                      onClick={() => changeParams(allFieldNames.at(index))}
                    >
                      {props.headTitles.at(index)
                        ? props.headTitles.at(index)
                        : fieldName}
                    </th>
                  );
                else
                  return (
                    <th
                      key={index}
                      className={[Styles.th, Styles.cell_arrow_down].join(' ')}
                      onClick={() => changeParams(allFieldNames.at(index))}
                    >
                      {props.headTitles.at(index)
                        ? props.headTitles.at(index)
                        : fieldName}
                    </th>
                  );
              })}
            </tr>
          </thead>
          <tbody>
            {data.map((record: any, index: number) => {
              let link = undefined;
              link = processLink(record);
              return (
                <NTrow key={index} href={link}>
                  {Object.keys(record).map((key: string, index: number) => (
                    <NTcell key={index}>{record[key]}</NTcell>
                  ))}
                </NTrow>
              );
            })}
          </tbody>
        </table>
      </div>
      {pageCount && (
        <PageSelector
          page={params.page}
          maxPage={pageCount}
          pageCallback={pageCallback}
        />
      )}
    </>
  );
}
