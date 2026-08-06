'use client';

import { useCallback, useEffect, useState } from 'react';
import DdStyles from './dropdown.module.css';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { changeLanguage } from '../../i18n/client';
import Dropdown from './dropdown';

export default function Header() {
  const [mounted, setMounted] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLanguageChange = async (lang: string) => {
    await changeLanguage(lang);
  };

  const handleNavigation = useCallback(
    (targetPath: string) => {
      if (pathname === targetPath) {
        const currentParams = searchParams.toString();
        router.push(`${targetPath}?${currentParams}`);
      } else {
        router.push(targetPath);
      }
    },
    [pathname, router, searchParams],
  );

  if (!mounted) {
    return null;
  }

  return (
    <div
      key={i18n.language}
      className="flex items-center sticky top-0 z-50 w-full h-16 bg-main"
    >
      <div className="flex items-center w-fit">
        <h1
          className={`${DdStyles.header_elem_static} select-none bg-main-light font-bold italic text-[28px]`}
        >
          ETRX
        </h1>

        <button
          onClick={() => handleNavigation('/')}
          className={DdStyles.header_elem}
        >
          {t('header:main')}
        </button>

        <button
          onClick={() => handleNavigation('/contest')}
          className={DdStyles.header_elem}
        >
          {t('header:contests')}
        </button>

        <button
          onClick={() => handleNavigation('/user')}
          className={DdStyles.header_elem}
        >
          {t('header:users')}
        </button>

        <Dropdown
          header={t('header:problems')}
          onClick={() => handleNavigation('/problem')}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNavigation('/tags');
            }}
            className={DdStyles.dropdown_elem}
          >
            {t('header:setup_tags_priority')}
          </button>
        </Dropdown>

        <button
          onClick={() => handleNavigation('/protocol')}
          className={DdStyles.header_elem}
        >
          {t('header:protocol')}
        </button>

        <button
          onClick={() => handleNavigation('/about')}
          className={DdStyles.header_elem}
        >
          {t('header:about')}
        </button>
      </div>

      <div className="flex items-center gap-4 ml-auto mr-2">
        <Dropdown header={t('header:cl')}>
          <button
            className={DdStyles.dropdown_elem}
            onClick={(e) => {
              e.stopPropagation();
              handleLanguageChange('ru');
            }}
          >
            Русский
          </button>
          <button
            className={DdStyles.dropdown_elem}
            onClick={(e) => {
              e.stopPropagation();
              handleLanguageChange('en');
            }}
          >
            English
          </button>
        </Dropdown>

        <div className="flex flex-col items-left text-xs text-white">
          <div>Version: {process.env.NEXT_PUBLIC_VERSION}</div>
        </div>
      </div>
    </div>
  );
}
