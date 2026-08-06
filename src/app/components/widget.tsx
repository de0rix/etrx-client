import Styles from './widget.module.css';

export function Widget({ title, data }: { title: string; data: any }) {
  return (
    <div>
      <details className={Styles.widget}>
        <summary className={Styles.summary}>{title}</summary>
        <div className={Styles.open}>{data}</div>
      </details>
    </div>
  );
}
