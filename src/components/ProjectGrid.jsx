import React from 'react';
import ProjectCard from './ProjectCard';

export default function ProjectGrid({
  projects,
  isAdmin = false,
  selectedTab,
  setProjects,
  onDone,
  onDelete,
  onRename,
}) {
  const handleFavorite = (projectId) => {
    setProjects((prevProjects) =>
      prevProjects.map((project) =>
        project._id === projectId
          ? { ...project, isFavorite: !project.isFavorite }
          : project
      )
    );
  };

  // Filter based on tab
  const filteredProjects = projects.filter((project) => {
    if (selectedTab === 'Favorite') return project.isFavorite;
    if (selectedTab === 'Done') return project.isDone;
    return !project.isDone;
  });

  if (!filteredProjects || !filteredProjects.length) {
    return (
      <p className="text-center text-gray-500 dark:text-gray-400">
        No projects to show.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {filteredProjects.map((project) => (
        <ProjectCard
          key={project._id}
          project={project}
          isAdmin={isAdmin}
          onFavorite={handleFavorite}
          onDone={onDone}
          onDelete={onDelete}
          onRename={onRename}
        />
      ))}
    </div>
  );
}
