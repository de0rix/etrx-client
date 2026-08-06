import Styles from './contest-table.module.css';

type Props = {
  children?: React.ReactNode;
};

type TableProps = {
  data: any;
};

export function CTrow({ children }: Props) {
  return <tr className={Styles.row}>{children}</tr>;
}

export function CTcell({ children }: Props) {
  return <td className={Styles.cell}>{children}</td>;
}

export function ContestTable({ data }: TableProps) {
  if (data.message && data.message === 'Fetch failed')
    return (
      <h1 className="text-center text-lg mt-5 mb-5">
        Sorry, remote data is not available. <br />
        Check your connection.
      </h1>
    );

  const contests = Array.from(data['contests']);

  return (
    <div className={Styles.container}>
      <table className={Styles.table}>
        <thead>
          <tr>
            <th className={Styles.th}>ID</th>
            <th className={Styles.th}>Имя контеста</th>
            <th className={Styles.th}>Время начала</th>
          </tr>
        </thead>
        <tbody>
          {contests.map((entry: any) => (
            <CTrow key={entry.contestId}>
              <CTcell>{entry.contestId}</CTcell>
              <CTcell>{entry.name}</CTcell>
              <CTcell>{entry.startTime}</CTcell>
            </CTrow>
          ))}
        </tbody>
      </table>
    </div>
  );
}
