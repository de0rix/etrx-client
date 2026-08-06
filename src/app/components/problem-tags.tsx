import Styles from './problem-tags.module.css';

export function GetDivTagsList(tags: string[]) {
  return (
    <div>
      {tags.map((tag, i) => (
        <div key={i} className={Styles.tag}>
          {tag}
        </div>
      ))}
    </div>
  );
}
