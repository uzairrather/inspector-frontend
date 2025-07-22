/* eslint-disable react-hooks/exhaustive-deps */
import { useMemo } from 'react';
import { TABS } from '@/constants/tabs';

export default function useProjectTabs(projects, selectedTab) {
  const now = new Date();

  const filteredProjects = useMemo(() => {
    switch (selectedTab) {
      case TABS.NEW:
        return projects.filter((p) => !p.isFavorite && !p.isDone);
      case TABS.RECENT:
        return projects.filter((p) => !p.isFavorite && !p.isDone && p.updatedAt);
      case TABS.FAVORITE:
        return projects.filter((p) => p.isFavorite);
      case TABS.DONE:
        return projects.filter((p) => {
          if (!p.isDone || !p.doneAt) return false;
          const doneDate = new Date(p.doneAt);
          const daysDiff = (now - doneDate) / (1000 * 60 * 60 * 24);
          return daysDiff <= 7;
        });
      default:
        return projects;
    }
  }, [projects, selectedTab]);

  return { filteredProjects };
}
