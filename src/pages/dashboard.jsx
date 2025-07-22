import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import DashboardHeader from "../components/DashboardHeader";
import ProjectTabs from "../components/ProjectTabs";
import ProjectGrid from "../components/ProjectGrid";
import CreateProjectModal from "../components/CreateProjectModal";
import { API_BASE_URL } from "@/constants/config";
import { TABS } from "@/constants/tabs";
import useProjectTabs from "@/hooks/useProjectTabs";

export default function DashboardPage() {
  const [projects, setProjects] = useState([]);
  const [searchResults, setSearchResults] = useState(null);
  const [selectedTab, setSelectedTab] = useState(TABS.NEW);
  const [showModal, setShowModal] = useState(false);
  const [company, setCompany] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resetSignal, setResetSignal] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const selectedCompanyId = localStorage.getItem("selectedCompanyId");

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${API_BASE_URL}/api/projects/company/${selectedCompanyId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (res.ok) {
        setProjects(data.projects || []);
        setCompany(data.company || "");
        setRole(data.role || "");
      } else {
        toast.error(data.message || "Failed to fetch projects.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error fetching data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      toast.error("Unauthorized. Please log in.");
      navigate("/login");
      return;
    }

    if (!selectedCompanyId) {
      toast.error("Please select a company first.");
      navigate("/select-company");
      return;
    }

    fetchProjects();
  }, [navigate, selectedCompanyId, token]);

  const handleProjectCreated = () => {
    fetchProjects();
    setSelectedTab(TABS.NEW);
  };

  const handleSearch = async (query, context) => {
    try {
      let url = `${API_BASE_URL}/api/search?query=${encodeURIComponent(
        query
      )}&context=${context}`;

      if (
        (context === "folder" || context === "asset") &&
        projects.length > 0
      ) {
        const selectedProjectId = projects[0]._id;
        url += `&projectId=${selectedProjectId}`;
      }

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (res.ok) {
        setSearchResults(data.results || []);
        setResetSignal((prev) => !prev); // trigger search bar reset
        toast.success(`Found ${data.results.length} ${context}s`);
      } else {
        toast.error(data.message || "Search failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error during AI search.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-slate-800 to-teal-500 dark:bg-zinc-900 p-4 md:p-8">
      <DashboardHeader
        company={company}
        role={role}
        onSearch={handleSearch}
        resetSignal={resetSignal}
      />

      <div className="flex items-center justify-between mt-6 mb-4">
        <ProjectTabs selected={selectedTab} onChange={setSelectedTab} />
        {role === "admin" && (
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-800"
          >
            + Create Project
          </button>
        )}
      </div>

      {/* ✅ Loading State */}
      {loading ? (
        <div className="text-center text-white py-12 text-lg font-medium">
          Loading projects...
        </div>
      ) : searchResults ? (
        <div className="bg-white dark:bg-zinc-800 p-4 rounded-lg shadow">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
              Search Results
            </h2>
            <button
              onClick={() => setSearchResults(null)}
              className="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 dark:bg-zinc-700 dark:text-blue-300 dark:hover:bg-zinc-600"
            >
              ← Back to Dashboard
            </button>
          </div>
          <ul className="divide-y divide-gray-200 dark:divide-zinc-700">
           {searchResults.map((item) => {
  let type = "unknown";

  if (item.assetName) type = "asset";
  else if (item.project && item.parent !== undefined) type = "folder";
  else type = "project";

  const handleClick = () => {
    if (type === "folder") {
      navigate(`/subproject/${item.project}?folderId=${item._id}`);
    } else if (type === "asset") {
      navigate(`/asset/${item._id}`);
    } else if (type === "project") {
      navigate(`/subproject/${item._id}`);
    }
  };

  return (
    <li
      key={item._id}
      onClick={handleClick}
      className="py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-700 px-2 rounded"
    >
      <div className="font-medium text-blue-700 dark:text-blue-300 underline">
        {item.name || item.assetName}
      </div>
      <div className="text-xs text-gray-500">ID: {item._id}</div>
    </li>
  );
})}

          </ul>
        </div>
      ) : (
        <ProjectGrid
          projects={projects}
          isAdmin={role === "admin"}
          selectedTab={selectedTab}
          setProjects={setProjects}
          onFavorite={async (projectId) => {
            try {
              const res = await fetch(
                `${API_BASE_URL}/api/projects/${projectId}/favorite`,
                {
                  method: "PATCH",
                  headers: { Authorization: `Bearer ${token}` },
                }
              );
              if (!res.ok) throw new Error("Failed to toggle favorite");

              setProjects((prev) =>
                prev.map((p) =>
                  p._id === projectId ? { ...p, isFavorite: !p.isFavorite } : p
                )
              );
            } catch (err) {
              console.error(err);
              toast.error("Failed to update favorite");
            }
          }}
          onDone={(projectId) => {
            setProjects((prev) =>
              prev.map((p) =>
                p._id === projectId ? { ...p, isDone: !p.isDone } : p
              )
            );
          }}
          onRename={(updatedProject) => {
            setProjects((prev) =>
              prev.map((p) =>
                p._id === updatedProject._id ? updatedProject : p
              )
            );
          }}
          onDelete={(projectId) => {
            setProjects((prev) => prev.filter((p) => p._id !== projectId));
          }}
        />
      )}

      {showModal && (
        <CreateProjectModal
          onClose={() => setShowModal(false)}
          onCreate={handleProjectCreated}
        />
      )}
    </div>
  );
}
