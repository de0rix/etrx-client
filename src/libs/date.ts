'use client';

import { TFunction } from 'next-i18next';

export function unixToFormattedDate(unixTime: number, t: TFunction): string {
  const months = [
    t('common:months.january'),
    t('common:months.february'),
    t('common:months.march'),
    t('common:months.april'),
    t('common:months.may'),
    t('common:months.june'),
    t('common:months.july'),
    t('common:months.august'),
    t('common:months.september'),
    t('common:months.october'),
    t('common:months.november'),
    t('common:months.december'),
  ];

  const date = new Date(unixTime * 1000);

  const month = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();

  return `${month} ${day} ${year}`;
}

export function unixToFormattedDateTime(
  unixTime: number,
  t: TFunction,
): string {
  const months = [
    t('common:months.january'),
    t('common:months.february'),
    t('common:months.march'),
    t('common:months.april'),
    t('common:months.may'),
    t('common:months.june'),
    t('common:months.july'),
    t('common:months.august'),
    t('common:months.september'),
    t('common:months.october'),
    t('common:months.november'),
    t('common:months.december'),
  ];

  const date = new Date(unixTime * 1000);

  const month = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();

  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  return `${hours}:${minutes}, ${month} ${day} ${year}`;
}
