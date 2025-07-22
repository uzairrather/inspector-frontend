import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FolderPlus, FilePlus, Home, ChevronRight } from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "@/constants/config";
import CreateFolderModal from "@/components/CreateFolderModal";
import CreateAssetModal from "@/components/CreateAssetModal";
import { toast } from "react-toastify";
import AssetCard from "@/components/AssetCard";

const SubProject = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const searchParams = new URLSearchParams(location.search);
  const folderId = searchParams.get("folderId");

  const [project, setProject] = useState(null);
  const [folders, setFolders] = useState([]);
  const [assets, setAssets] = useState([]);
  const [parentFolder, setParentFolder] = useState(null);
  const [breadcrumbTrail, setBreadcrumbTrail] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [folderAssetCounts, setFolderAssetCounts] = useState({});

  const token = localStorage.getItem("token");

  const fetchFolderAssetCounts = async (folders) => {
    const counts = {};
    await Promise.all(
      folders.map(async (folder) => {
        try {
          const res = await axios.get(
            `${API_BASE_URL}/api/folders/asset-count/${folder._id}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          counts[folder._id] = res.data.count || 0;
        } catch (err) {
          console.error(`Error fetching asset count for folder ${folder._id}:`, err);
          counts[folder._id] = 0;
        }
      })
    );
    setFolderAssetCounts(counts);
  };

  const buildBreadcrumb = async (folder) => {
    const trail = [];
    let current = folder;
    while (current) {
      trail.unshift(current); // add to beginning
      if (!current.parent) break;
      try {
        const res = await axios.get(`${API_BASE_URL}/api/folders/id/${current.parent}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        current = res.data;
      } catch (err) {
        console.error("Error fetching parent folder:", err);
        break;
      }
    }
    setBreadcrumbTrail(trail);
  };

  const fetchData = async () => {
    try {
      const projectPromise = axios.get(`${API_BASE_URL}/api/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      let foldersPromise;
      let parentFolderPromise = null;
      let assetsPromise = null;

      if (folderId) {
        foldersPromise = axios.get(
          `${API_BASE_URL}/api/folders/subfolders/${folderId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        parentFolderPromise = axios.get(
          `${API_BASE_URL}/api/folders/id/${folderId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        assetsPromise = axios.get(
          `${API_BASE_URL}/api/assets/folder/${folderId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } else {
        foldersPromise = axios.get(
          `${API_BASE_URL}/api/folders/project/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        assetsPromise = axios.get(`${API_BASE_URL}/api/assets/project/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      if (!foldersPromise) foldersPromise = Promise.resolve({ data: [] });
      if (!parentFolderPromise) parentFolderPromise = Promise.resolve(null);
      if (!assetsPromise) assetsPromise = Promise.resolve({ data: [] });

      const [projectRes, foldersRes, parentFolderRes, assetsRes] =
        await Promise.all([
          projectPromise,
          foldersPromise,
          parentFolderPromise,
          assetsPromise,
        ]);

      setProject(projectRes.data);
      setFolders(foldersRes?.data || []);
      if (parentFolderRes?.data) {
        setParentFolder(parentFolderRes.data);
        buildBreadcrumb(parentFolderRes.data);
      } else {
        setBreadcrumbTrail([]);
      }

      if (foldersRes?.data?.length > 0) {
        fetchFolderAssetCounts(foldersRes.data);
      }

      setAssets([]);
      if (assetsRes?.data) setAssets(assetsRes.data);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id, folderId]);

  const handleFolderCreated = (newFolder) => {
    setFolders((prev) => [...prev, newFolder]);
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#f4f6ff] flex flex-col relative px-4 sm:px-6 md:px-8 lg:px-6 bg-gradient-to-r from-slate-800 to-teal-500">
      <main className="flex-1 p-4 pb-28 sm:pb-8">
        <div className="mb-6">
          <Link
            to="/dashboard"
            className="text-base font-bold text-blue-600 hover:underline flex items-center gap-1"
          >
            <Home size={18} /> All Projects
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mt-1 break-words">
            {project?.name || "Project"}
          </h1>

          {breadcrumbTrail.length > 0 && (
            <div className="mt-2 flex flex-wrap  items-center gap-1 text-sm text-gray-700 font-medium">
              {breadcrumbTrail.map((folder, idx) => (
                <span key={folder._id} className="flex items-center gap-1">
                  {idx !== 0 && <ChevronRight size={14} />}
                  <button
                    onClick={() =>
                      navigate(`/subproject/${id}?folderId=${folder._id}`)
                    }
                    className="hover:underline text-blue-600"
                  >
                    {folder.name}
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {folderId && (
          <div className="bg-blue-200  border border-gray-200 rounded-xl px-6 py-4 shadow-sm mb-4">
            <button
              onClick={() => navigate(`/subproject/${id}`)}
              className="text-xl font-bold text-zinc-800 hover:text-blue-600 focus:outline-none"
            >
              {parentFolder?.name || "Back to Parent"}
            </button>
          </div>
        )}

        {/* Folders */}
        <div className=" border border-gray-200 rounded-xl p-6 shadow-sm mb-6 bg-gradient-to-r from-slate-800 to-teal-500">
          <h2 className="text-xl font-bold text-white mb-4 ">All Folders</h2>
          {folders.length === 0 ? (
            <div className="text-gray-500">No folders found.</div>
          ) : (
            <div className=" grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {folders.map((folder) => (
                <div
                  key={folder._id}
                  onClick={() => {
                    navigate(`/subproject/${id}?folderId=${folder._id}`);
                  }}
                  className="cursor-pointer bg-blue-200 rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition duration-300 relative flex flex-col justify-between"
                >
                  <div className="absolute top-3 left-3">
                    <div className="relative">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-blue-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 7a2 2 0 012-2h4l2 2h7a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
                        />
                      </svg>
                      <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center shadow-sm">
                        +
                      </span>
                    </div>
                  </div>
                  <div className="absolute top-3 right-3 text-gray-700 hover:text-black cursor-pointer text-2xl font-bold">
                    &#x22EE;
                  </div>
                  <h2 className="text-xl font-bold text-zinc-900 capitalize mt-6">
                    {folder.name}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Created by:{" "}
                    {folder?.createdBy?.fullName?.split(" ")[0] || "Unknown"}
                  </p>
                  <p className="text-sm text-gray-500">
                    Assets: {folderAssetCounts[folder._id] ?? 0}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {assets.data?.length > 0 && (
          <div className="bg-gradient-to-r from-slate-800 to-teal-500 border border-gray-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-white  mb-4">All Assets</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {assets.data.map((asset) => (
                <div
                  key={asset._id}
                  className="cursor-pointer"
                  onClick={() => navigate(`/asset/${asset._id}`)}
                >
                  <AssetCard asset={asset} />
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Floating buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t z-40 px-4 py-3 sm:hidden shadow-md">
        <div className="flex flex-col xs:flex-row gap-2">
          <Button
            onClick={() => setShowFolderModal(true)}
            className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700"
          >
            <FolderPlus size={16} />{" "}
            {folderId ? "Sub New Folder" : "New Folder"}
          </Button>
          <Button
            onClick={() => setShowAssetModal(true)}
            className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700"
          >
            <FilePlus size={16} /> {folderId ? "Sub New Asset" : "New Asset"}
          </Button>
        </div>
      </div>

      {/* Top-right buttons */}
      <div className="hidden sm:flex gap-3 absolute top-4 right-4 mr-6">
        <Button
          onClick={() => setShowFolderModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
        >
          <FolderPlus size={16} /> {folderId ? "Sub New Folder" : "New Folder"}
        </Button>
        <Button
          onClick={() => setShowAssetModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
        >
          <FilePlus size={16} /> {folderId ? "Sub New Asset" : "New Asset"}
        </Button>
      </div>

      {/* Modals */}
      <CreateFolderModal
        projectId={id}
        parentId={folderId}
        onCreated={handleFolderCreated}
        open={showFolderModal}
        setOpen={setShowFolderModal}
      />
      <CreateAssetModal
        open={showAssetModal}
        setOpen={setShowAssetModal}
        folderId={folderId}
        projectId={id}
        userId={localStorage.getItem("userId")}
        onCreated={fetchData}
      />
    </div>
  );
};

export default SubProject;
