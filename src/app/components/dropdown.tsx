import { MouseEventHandler, useEffect, useRef, useState } from 'react';
import Styles from './dropdown.module.css';

type Props = {
  header: React.ReactNode;
  children?: React.ReactNode;
  onClick?: MouseEventHandler;
};

export default function Dropdown(props: Props) {
  const [matches, setMatches] = useState(false);
  const headRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Need to match media for 900px min width to
  // make dropdown scaling work when window resizes
  // beyond the media query in css that hides it
  useEffect(() => {
    if (!window) return;
    window
      .matchMedia('(min-width: 900px)')
      .addEventListener('change', (e) => setMatches(e.matches));
    return () =>
      document.removeEventListener('change', (_) => setMatches(false));
  }, []);

  useEffect(() => {
    if (headRef.current && contentRef.current) {
      contentRef.current.style.display = 'block';
      headRef.current.style.width = getComputedStyle(contentRef.current).width;
      contentRef.current.style.display = '';
    }
  }, [headRef, contentRef, matches]);

  return (
    <div
      ref={headRef}
      className={`${Styles.dropdown} ${Styles.header_elem}`}
      onClick={props.onClick}
    >
      {props.header}
      <div
        ref={contentRef}
        className={`${Styles.dropdown_menu} ${Styles.dropdown_menu_anim} ${Styles.dropdown_menu_1}`}
      >
        {props.children}
      </div>
    </div>
  );
}
