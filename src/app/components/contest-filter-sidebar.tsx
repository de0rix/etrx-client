'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './filter-sidebar.module.css';

interface ContestFilterSidebarProps {
  initialGymFilter: number;
  initialSource: string;
  initialContestId: string;
  sourceOptions: string[];
  onApply: (filters: {
    gymFilter: number;
    source: string;
    contestId: string;
  }) => void;
}

export default function ContestFilterSidebar({
  initialGymFilter,
  initialSource,
  initialContestId,
  sourceOptions,
  onApply,
}: ContestFilterSidebarProps) {
  const { t } = useTranslation(['contest']);
  const [gymFilter, setGymFilter] = useState(initialGymFilter);
  const [source, setSource] = useState(initialSource);
  const [contestId, setContestId] = useState(initialContestId);

  useEffect(() => {
    setGymFilter(initialGymFilter);
    setSource(initialSource);
    setContestId(initialContestId);
  }, [initialGymFilter, initialSource, initialContestId]);

  const handleReset = () => {
    onApply({ gymFilter: 2, source: '', contestId: '' });
  };

  const renderOption = (
    value: string,
    label: string,
    selected: boolean,
    onChange: () => void,
  ) => (
    <label key={value} className={styles.gridItem}>
      <input type="radio" checked={selected} onChange={onChange} />
      <span>{label}</span>
    </label>
  );

  return (
    <aside className={styles.sidebar}>
      <div className={styles.scrollArea}>
        <div className={styles.section}>
          <div className={styles.title}>{t('contest:filtersTitle')}</div>
          <div className={styles.listArea}>
            {renderOption('2', t('contest:filters.all'), gymFilter === 2, () =>
              setGymFilter(2),
            )}
            {renderOption(
              '1',
              t('contest:filters.gymOnly'),
              gymFilter === 1,
              () => setGymFilter(1),
            )}
            {renderOption(
              '0',
              t('contest:filters.contestsOnly'),
              gymFilter === 0,
              () => setGymFilter(0),
            )}
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.title}>{t('contest:filters.contestId')}</div>
          <input
            type="number"
            className={styles.inputText}
            min="1"
            value={contestId}
            onChange={(event) => setContestId(event.target.value)}
            placeholder="ID"
          />
        </div>

        <div className={styles.section}>
          <div className={styles.title}>{t('contest:filters.source')}</div>
          <div className={styles.listArea}>
            {renderOption(
              '',
              t('contest:filters.allSources'),
              source === '',
              () => setSource(''),
            )}
            {sourceOptions.map((option) =>
              renderOption(option, option, source === option, () =>
                setSource(option),
              ),
            )}
          </div>
        </div>
      </div>

      <div className={styles.applyWrapper}>
        <button
          type="button"
          className={styles.applyBtn}
          onClick={() => onApply({ gymFilter, source, contestId })}
        >
          {t('contest:filters.apply')}
        </button>
        <button type="button" className={styles.resetBtn} onClick={handleReset}>
          {t('contest:filters.reset')}
        </button>
      </div>
    </aside>
  );
}
