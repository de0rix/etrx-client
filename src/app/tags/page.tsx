'use client';

import React, { Suspense, useCallback, useEffect, useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { getTags, UpdateTag, UpdateTags, updateTags } from '../services/tags';
import GizmoSpinner from '../components/gizmo-spinner';
import { useTranslation } from 'react-i18next';
import { useIsClient } from '@/hooks/useIsClient';
import { Tag } from '../models/Tag';
import styles from './page.module.css';
import { TFunction } from 'next-i18next';

const SortableTag = ({ tag, t }: { tag: Tag; t: TFunction }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tag.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : 1,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={styles.tagItem}
    >
      <span className={styles.tagName}>{tag.name}</span>
      <div className={styles.tagInfo}>
        <span className={styles.priorityText}>
          {t('tag:priority')}: {tag.priority}
        </span>
      </div>
    </div>
  );
};

function TagsClientPage() {
  const { t } = useTranslation(['tag', 'common']);
  const isClient = useIsClient();

  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getTags();
      if (!response.ok) {
        throw new Error(t('common:error', { statusCode: response.status }));
      }
      const data = await response.json();
      const sortedTags = (data as Tag[]).sort(
        (a, b) => b.priority - a.priority,
      );
      setTags(sortedTags);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (isClient) {
      fetchData();
    }
  }, [isClient, fetchData]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setTags((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    const updateList = tags.map(
      (tag, index) => new UpdateTag(tag.id, tags.length - index),
    );
    const payload = new UpdateTags(updateList);

    try {
      const response = await updateTags(payload);
      if (!response.ok) throw new Error('Update failed');
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isClient) return <GizmoSpinner />;

  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.title}>{t('tag:title')}</h1>

      {isLoading ? (
        <GizmoSpinner />
      ) : (
        <>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={tags.map((t) => t.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className={styles.listContainer}>
                {tags.map((tag) => (
                  <SortableTag key={tag.id} tag={tag} t={t} />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          <div className={styles.actions}>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={styles.btnSave}
            >
              {t('tag:saveBtn')}
            </button>
            <button onClick={fetchData} className={styles.btnReset}>
              {t('tag:resetBtn')}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<GizmoSpinner />}>
      <TagsClientPage />
    </Suspense>
  );
}
