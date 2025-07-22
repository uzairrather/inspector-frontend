import React from 'react'; 
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MoreVertical, Star } from 'lucide-react';

export default function ProjectCard({ project, isAdmin, onFavorite, onDone, onRename }) {
  const navigate = useNavigate();
  // console.log(project)
  const assetCount = project.assetCount || 0; // ✅ Fixed this line

  // console.log("ProjectCard project prop:", project);
  // console.log("assets", assetCount)

  return (
    <div
      className="border rounded-2xl p-4 shadow-md bg-blue-200 dark:bg-zinc-800 relative hover:cursor-pointer"
      onClick={() => navigate(`/subproject/${project._id}`)}
    >
      <div className="flex justify-between items-start">
        <div>
          <h2 className="font-bold text-lg text-zinc-800 dark:text-white">
            {project.name}
          </h2>

          {isAdmin && project.createdBy?.fullName && (
            <p className="text-sm text-gray-500 dark:text-gray-300 mt-1">
              Created by: {project.createdBy.fullName}
            </p>
          )}

          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Assets: {assetCount}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation(); // Prevent card click
              onFavorite(project._id);
            }}
            className="text-yellow-500 hover:text-yellow-600 transition"
            title={project.isFavorite ? 'Unfavorite' : 'Mark as Favorite'}
          >
            {project.isFavorite ? <Star fill="currentColor" /> : <Star className="fill-gray-500" />}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation(); // Prevent card click
              onRename(project);
            }}
            className="text-gray-500 hover:text-gray-700 transition"
            title="Rename Project"
          >
            <MoreVertical />
          </button>
        </div>
      </div>

      <div className="flex gap-3 mt-4">
        <Button
          variant="outline"
          onClick={(e) => {
            e.stopPropagation(); // Prevent card click
            onDone(project._id);
          }}
          className="text-sm bg-blue-500 text-white"
        >
          {project.isDone ? 'Undo Done' : 'Mark Done'}
        </Button>
      </div>
    </div>
  );
}
