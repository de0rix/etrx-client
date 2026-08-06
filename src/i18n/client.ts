'use client';

import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import ruHeader from '../locales/ru/header.json';
import ruAbout from '../locales/ru/about.json';
import ruContest from '../locales/ru/contest.json';
import ruProblem from '../locales/ru/problem.json';
import ruUser from '../locales/ru/user.json';
import ruHome from '../locales/ru/home.json';
import ruContestId from '../locales/ru/contestId.json';
import ruCommon from '../locales/ru/common.json';
import ruProtocol from '../locales/ru/protocol.json';
import ruTag from '../locales/ru/tag.json';
import enHeader from '../locales/en/header.json';
import enAbout from '../locales/en/about.json';
import enContest from '../locales/en/contest.json';
import enUser from '../locales/en/user.json';
import enProblem from '../locales/en/problem.json';
import enHome from '../locales/en/home.json';
import enContestId from '../locales/en/contestId.json';
import enCommon from '../locales/en/common.json';
import enProtocol from '../locales/en/protocol.json';
import enTag from '../locales/en/tag.json';
import Cookies from 'js-cookie';
import { i18n } from 'next-i18next';

const LANGUAGE_COOKIE = 'selected_language';

const getInitialLanguage = () => {
  if (typeof window === 'undefined') return 'ru';
  return Cookies.get(LANGUAGE_COOKIE) || 'ru';
};

i18next.use(initReactI18next).init({
  resources: {
    ru: {
      header: ruHeader,
      about: ruAbout,
      contest: ruContest,
      user: ruUser,
      problem: ruProblem,
      home: ruHome,
      contestId: ruContestId,
      common: ruCommon,
      protocol: ruProtocol,
      tag: ruTag,
    },
    en: {
      header: enHeader,
      about: enAbout,
      contest: enContest,
      user: enUser,
      problem: enProblem,
      home: enHome,
      contestId: enContestId,
      common: enCommon,
      protocol: enProtocol,
      tag: enTag,
    },
  },
  lng: getInitialLanguage(),
  fallbackLng: 'ru',
  interpolation: {
    escapeValue: false,
  },
});

export const changeLanguage = (lng: string) => {
  i18next.changeLanguage(lng);
  Cookies.set(LANGUAGE_COOKIE, lng, { expires: 365 });
  document.documentElement.lang = lng;
};

export default i18next;
