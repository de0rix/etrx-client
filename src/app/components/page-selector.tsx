import Styles from './page-selector.module.css';

type Props = {
  page: number;
  maxPage: number;
  pageCallback: (page: number) => void;
};

export default function PageSelector({ page, maxPage, pageCallback }: Props) {
  const maxPageHop = 2;
  const button = (
    targetPage: number,
    name: string,
    className: string,
    disabled: boolean,
  ) =>
    disabled ? (
      <div className={`${Styles.cont_placeholder} ${Styles.button}`}></div>
    ) : (
      <button
        name={name}
        onClick={() => pageCallback(targetPage)}
        className={`${className} ${Styles.button}`}
      ></button>
    );

  const pageButtons = [];
  for (let it = 1; it <= maxPageHop - page + 1; it++)
    pageButtons.push(
      <div
        key={`front-${it}`}
        className={`${Styles.placeholder} ${Styles.button}`}
      ></div>,
    );
  for (
    let it = Math.max(1, page - maxPageHop);
    it <= Math.min(maxPage, page + maxPageHop);
    it++
  )
    pageButtons.push(
      <button
        name={`Page ${it}`}
        key={it}
        onClick={() => pageCallback(it)}
        className={Styles.button}
      >
        {it}
      </button>,
    );
  for (let it = 1; it <= maxPageHop - maxPage + page; it++)
    pageButtons.push(
      <div
        key={`back-${it}`}
        className={`${Styles.placeholder} ${Styles.button}`}
      ></div>,
    );

  return (
    <>
      <div className={Styles.pad}>
        {button(1, 'First page', Styles.first_button, page === 1)}
        {button(page - 1, 'Previous page', Styles.prev_button, page === 1)}
        {pageButtons}
        {button(page + 1, 'Next page', Styles.next_button, page === maxPage)}
        {button(maxPage, 'Last page', Styles.last_button, page === maxPage)}
      </div>
      <div className={Styles.silent_pad}>
        {button(1, 'First page', Styles.first_button, page === 1)}
        {button(page - 1, 'Previous page', Styles.prev_button, page === 1)}
        {button(page + 1, 'Next page', Styles.next_button, page === maxPage)}
        {button(maxPage, 'Last page', Styles.last_button, page === maxPage)}
      </div>
    </>
  );
}
