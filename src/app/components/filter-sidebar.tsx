'use client';
import React, { useState, useEffect } from 'react';
import styles from './filter-sidebar.module.css';
import { FilterBounds } from '../models/FilterBounds';
import { useTranslation } from 'react-i18next';

interface SidebarProps {
  totalBounds: FilterBounds;
  currentBounds: FilterBounds;
  initialFilters: any;
  onApply: (data: any) => void;
}

const clamp = (
  value: number | undefined,
  min: number | undefined,
  max: number | undefined,
) => {
  if (value === undefined || value === null) return undefined;
  if (min !== undefined && value < min) return min;
  if (max !== undefined && value > max) return max;
  return value;
};

const RangeBlock = ({
  label,
  minKey,
  maxKey,
  rangeFilters,
  setRangeFilters,
  placeholderMin,
  placeholderMax,
  t,
}: {
  label: string;
  minKey: string;
  maxKey: string;
  rangeFilters: any;
  setRangeFilters: React.Dispatch<React.SetStateAction<any>>;
  placeholderMin?: number;
  placeholderMax?: number;
  t: any;
}) => {
  const minVal = rangeFilters[minKey];
  const maxVal = rangeFilters[maxKey];

  return (
    <div className={styles.section}>
      <div className={styles.title}>{label}</div>
      <div className={styles.rangeInputs}>
        <input
          type="number"
          className={styles.inputRange}
          placeholder={`${t('problem:filters:from')} ${placeholderMin ?? ''}`}
          value={minVal ?? ''}
          onChange={(e) => {
            const val =
              e.target.value === '' ? undefined : Number(e.target.value);
            setRangeFilters((prev: any) => ({ ...prev, [minKey]: val }));
          }}
        />
        <input
          type="number"
          className={styles.inputRange}
          placeholder={`${t('problem:filters:to')} ${placeholderMax ?? ''}`}
          value={maxVal ?? ''}
          onChange={(e) => {
            const val =
              e.target.value === '' ? undefined : Number(e.target.value);
            setRangeFilters((prev: any) => ({ ...prev, [maxKey]: val }));
          }}
        />
      </div>
    </div>
  );
};

export default function FilterSidebar({
  totalBounds,
  currentBounds,
  initialFilters,
  onApply,
}: SidebarProps) {
  const { t } = useTranslation(['problem']);

  const [name, setName] = useState(initialFilters.problemName);
  const [tags, setTags] = useState<string[]>(initialFilters.tags);
  const [isOnly, setIsOnly] = useState(initialFilters.isOnly);
  const [indexes, setIndexes] = useState<string[]>(initialFilters.indexes);
  const [divisions, setDivisions] = useState<string[]>(
    initialFilters.divisions,
  );
  const [ranks, setRanks] = useState<string[]>(initialFilters.ranks);

  const [rangeFilters, setRangeFilters] = useState({
    minRating: initialFilters.minRating,
    maxRating: initialFilters.maxRating,
    minPoints: initialFilters.minPoints,
    maxPoints: initialFilters.maxPoints,
    minSolved: initialFilters.minSolved,
    maxSolved: initialFilters.maxSolved,
    minDifficulty: initialFilters.minDifficulty,
    maxDifficulty: initialFilters.maxDifficulty,
  });

  useEffect(() => {
    setRangeFilters({
      minRating: clamp(
        initialFilters.minRating,
        currentBounds.minRating,
        currentBounds.maxRating,
      ),
      maxRating: clamp(
        initialFilters.maxRating,
        currentBounds.minRating,
        currentBounds.maxRating,
      ),

      minPoints: clamp(
        initialFilters.minPoints,
        currentBounds.minPoints,
        currentBounds.maxPoints,
      ),
      maxPoints: clamp(
        initialFilters.maxPoints,
        currentBounds.minPoints,
        currentBounds.maxPoints,
      ),

      minSolved: clamp(
        initialFilters.minSolved,
        currentBounds.minSolved,
        currentBounds.maxSolved,
      ),
      maxSolved: clamp(
        initialFilters.maxSolved,
        currentBounds.minSolved,
        currentBounds.maxSolved,
      ),

      minDifficulty: clamp(
        initialFilters.minDifficulty,
        currentBounds.minDifficulty,
        currentBounds.maxDifficulty,
      ),
      maxDifficulty: clamp(
        initialFilters.maxDifficulty,
        currentBounds.minDifficulty,
        currentBounds.maxDifficulty,
      ),
    });

    setName(initialFilters.problemName);
    setTags(initialFilters.tags);
    setIndexes(initialFilters.indexes);
    setDivisions(initialFilters.divisions);
    setRanks(initialFilters.ranks);
    setIsOnly(initialFilters.isOnly);
  }, [initialFilters, currentBounds]);

  const handleReset = () => {
    const resetData = {
      problemName: '',
      tags: [],
      isOnly: true,
      indexes: [],
      divisions: [],
      ranks: [],
      minRating: totalBounds.minRating,
      maxRating: totalBounds.maxRating,
      minPoints: totalBounds.minPoints,
      maxPoints: totalBounds.maxPoints,
      minSolved: totalBounds.minSolved,
      maxSolved: totalBounds.maxSolved,
      minDifficulty: totalBounds.minDifficulty,
      maxDifficulty: totalBounds.maxDifficulty,
    };
    onApply(resetData);
  };

  const renderItem = (
    item: string,
    selectedList: string[],
    availableList: string[],
    setter: any,
    type: 'grid' | 'checkbox' = 'grid',
  ) => {
    const isSelected = selectedList.includes(item);
    const isAvailable = (availableList || []).includes(item);
    const isDisabled = !isAvailable && !isSelected;

    return (
      <label
        key={item}
        className={
          type === 'grid'
            ? `${styles.gridItem} ${isDisabled ? styles.disabled : ''}`
            : `${styles.checkboxItem} ${isDisabled ? styles.disabled : ''}`
        }
      >
        <input
          type="checkbox"
          checked={isSelected}
          disabled={isDisabled}
          onChange={() =>
            setter(
              isSelected
                ? selectedList.filter((i) => i !== item)
                : [...selectedList, item],
            )
          }
        />
        {type === 'grid' ? (
          <span>{item}</span>
        ) : (
          <>
            <span className={styles.box}></span>
            <span className={styles.label}>{item}</span>
          </>
        )}
      </label>
    );
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.scrollArea}>
        <div className={styles.section}>
          <div className={styles.title}>
            {t('problem:filters:problemSearch')}
          </div>
          <input
            type="text"
            className={styles.inputText}
            placeholder={t('problem:filters:problemName')}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className={styles.section}>
          <div className={styles.title}>{t('problem:filters:tags')}</div>
          <div className={styles.switcher}>
            <button
              className={`${styles.swBtn} ${!isOnly ? styles.active : ''}`}
              onClick={() => setIsOnly(false)}
            >
              {t('problem:filters:any')}
            </button>
            <button
              className={`${styles.swBtn} ${isOnly ? styles.active : ''}`}
              onClick={() => setIsOnly(true)}
            >
              {t('problem:filters:only')}
            </button>
          </div>
          <div className={styles.tagGrid}>
            {totalBounds.availableTags.map((tag) =>
              renderItem(tag, tags, currentBounds.availableTags, setTags),
            )}
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.title}>{t('problem:filters:indexes')}</div>
          <div className={styles.indexGrid}>
            {totalBounds.availableIndexes.map((idx) =>
              renderItem(
                idx,
                indexes,
                currentBounds.availableIndexes,
                setIndexes,
              ),
            )}
          </div>
        </div>

        <RangeBlock
          label={t('problem:filters:rating')}
          minKey="minRating"
          maxKey="maxRating"
          rangeFilters={rangeFilters}
          setRangeFilters={setRangeFilters}
          placeholderMin={currentBounds.minRating}
          placeholderMax={currentBounds.maxRating}
          t={t}
        />
        <RangeBlock
          label={t('problem:filters:difficulty')}
          minKey="minDifficulty"
          maxKey="maxDifficulty"
          rangeFilters={rangeFilters}
          setRangeFilters={setRangeFilters}
          placeholderMin={currentBounds.minDifficulty}
          placeholderMax={currentBounds.maxDifficulty}
          t={t}
        />
        <RangeBlock
          label={t('problem:filters:solvedCount')}
          minKey="minSolved"
          maxKey="maxSolved"
          rangeFilters={rangeFilters}
          setRangeFilters={setRangeFilters}
          placeholderMin={currentBounds.minSolved}
          placeholderMax={currentBounds.maxSolved}
          t={t}
        />
        <RangeBlock
          label={t('problem:filters:points')}
          minKey="minPoints"
          maxKey="maxPoints"
          rangeFilters={rangeFilters}
          setRangeFilters={setRangeFilters}
          placeholderMin={currentBounds.minPoints}
          placeholderMax={currentBounds.maxPoints}
          t={t}
        />

        <div className={styles.section}>
          <div className={styles.title}>{t('problem:filters:divisions')}</div>
          <div className={styles.listArea}>
            {totalBounds.availableDivisions.map((d) =>
              renderItem(
                d,
                divisions,
                currentBounds.availableDivisions,
                setDivisions,
                'checkbox',
              ),
            )}
          </div>
        </div>

        {totalBounds.availableRanks.length > 0 && (
          <div className={styles.section}>
            <div className={styles.title}>{t('problem:filters:ranks')}</div>
            <div className={styles.listArea}>
              {totalBounds.availableRanks.map((r) =>
                renderItem(
                  r,
                  ranks,
                  currentBounds.availableRanks,
                  setRanks,
                  'checkbox',
                ),
              )}
            </div>
          </div>
        )}
      </div>

      <div className={styles.applyWrapper}>
        <button
          className={styles.applyBtn}
          onClick={() =>
            onApply({
              problemName: name,
              tags,
              isOnly,
              indexes,
              divisions,
              ranks,
              ...rangeFilters,
            })
          }
        >
          {t('problem:filters:apply')}
        </button>
        <button className={styles.resetBtn} onClick={handleReset}>
          {t('problem:filters:reset')}
        </button>
      </div>
    </aside>
  );
}
