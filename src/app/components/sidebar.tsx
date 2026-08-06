'use client';
import { useRouter } from 'next/navigation';
import Styles from './sidebar.module.css';
import MiscStyles from './misc.module.css';
import { useCallback, useEffect, useState } from 'react';

type SidebarProps = {
  sidebarId: string;
};

const btnIdPostfix = '--open-btn';

export function Sidebar({ sidebarId }: SidebarProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const [matches, setMatches] = useState(false);

  const toggle = useCallback(() => {
    const sidebar = document.getElementById(sidebarId);
    const button = document.getElementById(sidebarId + btnIdPostfix);

    if (!sidebar || !button) return;

    if (getComputedStyle(sidebar).display == 'none') {
      sidebar.classList.remove(`${Styles.hide}`);
      sidebar.classList.add(`${Styles.show}`);
    } else {
      sidebar.classList.remove(`${Styles.show}`);
      sidebar.classList.add(`${Styles.hide}`);
    }

    button.style.display =
      getComputedStyle(button).display == 'none' ? 'block' : 'none';

    setOpen((currentOpen) => !currentOpen);
  }, [sidebarId]);

  const outOfSidebarPad = (
    <button className={Styles.out_of_sidebar} onClick={() => toggle()} />
  );

  useEffect(() => {
    if (!window) return;
    window
      .matchMedia('(min-width: 900px)')
      .addEventListener('change', (e) => setMatches(e.matches));
    return () =>
      document.removeEventListener('change', () => setMatches(false));
  }, []);

  useEffect(() => {
    if (open) {
      toggle();
    }
  }, [matches, open, toggle]);

  return (
    <>
      <button
        id={sidebarId + btnIdPostfix}
        onClick={() => {
          toggle();
        }}
        className={Styles.button}
      ></button>
      <div className={`${Styles.sidebar}`} id={sidebarId}>
        <div className={Styles.scrollable}>
          <div className={Styles.head}>ETRX</div>
          <button
            onClick={() => {
              toggle();
              router.push('/');
            }}
            className={Styles.option}
          >
            Главная
          </button>
          <div className={Styles.category}>Контесты</div>
          <button
            onClick={() => {
              toggle();
              router.push('/contests/view');
            }}
            className={Styles.option}
          >
            Просмотреть все
          </button>
          <button
            onClick={() => {
              toggle();
              router.push('/contests/add');
            }}
            className={Styles.option}
          >
            <span
              className={`${MiscStyles.add_ico} flex items-center justify-center`}
            ></span>
            Добавить
          </button>
          <div className={Styles.category}>Пользователи</div>
          <button
            onClick={() => {
              toggle();
              router.push('/users/view');
            }}
            className={Styles.option}
          >
            Просмотреть всех
          </button>
          <button
            onClick={() => {
              toggle();
              router.push('/users/add');
            }}
            className={Styles.option}
          >
            <span
              className={`${MiscStyles.add_ico} flex items-center justify-center`}
            ></span>
            Добавить
          </button>
        </div>
        <button
          onClick={() => {
            toggle();
            router.push('/about');
          }}
          className={Styles.option}
        >
          О сайте
        </button>
        <button
          onClick={() => {
            toggle();
          }}
          className={`${Styles.integrated_button_cont} ${Styles.category} justify-start absolute bottom-5`}
        >
          <div className={Styles.integrated_button}></div>
          <div>Выход</div>
        </button>
      </div>
      {open ? outOfSidebarPad : <></>}
    </>
  );
}
