// utils/projectUtils.js
export const getProjectsForTab = (tab, projects) => {
  const now = new Date();

  switch (tab) {
    case 'RECENT':
      return projects.filter(p => p.hasActivity); // updated recently
    case 'NEW':
      return projects.filter(p => !p.hasActivity);
    case 'FAVORITE':
      return projects.filter(p => p.isFavorite);
    case 'DONE':
      return projects.filter(p => {
        if (!p.isDone || !p.doneAt) return false;
        const daysSinceDone = (now - new Date(p.doneAt)) / (1000 * 60 * 60 * 24);
        return daysSinceDone <= 7;
      });
    default:
      return projects;
  }
};
