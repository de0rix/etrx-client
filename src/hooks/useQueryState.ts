'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef } from 'react';

export const useQueryState = (defaultValues?: Record<string, any>) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current && defaultValues) {
      isInitialMount.current = false;
      const params = new URLSearchParams(searchParams.toString());
      let needsUpdate = false;

      Object.entries(defaultValues).forEach(([key, value]) => {
        if (!params.has(key) && value !== null && value !== undefined) {
          params.set(key, String(value));
          needsUpdate = true;
        }
      });

      if (needsUpdate) {
        router.replace(`${pathname}?${params.toString()}`);
      }
    }
  }, [defaultValues, pathname, router, searchParams]);

  const setQueryParams = useCallback(
    (newParams: Record<string, any>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(newParams).forEach(([key, value]) => {
        if (value === null || value === undefined || value === '') {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      });

      router.replace(`${pathname}?${params.toString()}`);
    },
    [searchParams, pathname, router],
  );

  return { searchParams, setQueryParams };
};
