'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import '../../i18n/client';
import { changeLanguage } from '../../i18n/client';
import Cookies from 'js-cookie';

const LANGUAGE_COOKIE = 'selected_language';

export default function LanguageProvider() {
  const { i18n } = useTranslation();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const savedLanguage = Cookies.get(LANGUAGE_COOKIE) || 'ru';
    if (i18n.language !== savedLanguage) {
      changeLanguage(savedLanguage);
    }
  }, [i18n]);

  if (!isClient) {
    return null;
  }

  return null;
}
