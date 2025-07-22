"use client";

import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { Languages, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from '@/constants/config';

export default function Header() {
  const { t, i18n } = useTranslation();
  const [query, setQuery] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const dir = i18n.language === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = i18n.language;
    document.documentElement.dir = dir;
  }, [i18n.language]);

  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "ar" : "en";
    i18n.changeLanguage(newLang);
  };

  const handleSearch = async (e) => {
  if (e.key === "Enter" && query.trim() !== "") {
    try {
      const trimmedQuery = query.trim();
      const searchParams = new URLSearchParams(location.search);
      const folderId = searchParams.get("folderId");

      const match = location.pathname.match(/\/subproject\/([^/?]+)/);
      const projectId = match ? match[1] : null;

      // ✅ Improved context detection
      let context = "project";
      if (location.pathname.includes("/asset/")) {
        context = "asset"; // If user is on an asset detail page
      } else if (location.pathname.includes("/subproject/") && folderId) {
        context = "asset"; // If inside a folder — search assets
      } else if (location.pathname.includes("/subproject/")) {
        context = "folder"; // If in a project without folder selected
      }

      const token = localStorage.getItem("token");
      if (!token) {
        alert("Authentication token not found.");
        return;
      }

     const response = await axios.post(
  "https://inspector-backend-6q2a.onrender.com/api/search",
  {
    query: trimmedQuery,
    context,
    projectId,
    folderId,
  },
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);



      console.log("📥 Full search response:", response.data);

      const result = response.data.results?.[0];
      if (!result) {
        console.log("❌ No result found in response:", response.data.results);
        alert("No result found.");
        return;
      }

      const projId = projectId || result.project;

      // ✅ Navigate based on result type
      if (response.data.type === "project") {
        navigate(`/subproject/${result._id}`);
      } else if (response.data.type === "folder") {
        navigate(`/subproject/${projId}?folderId=${result._id}`);
      } else if (response.data.type === "asset") {
        navigate(`/asset/${result._id}`);
      }

      setQuery(""); // ✅ Clear input after successful search
    } catch (error) {
      console.error("❌ Search failed (catch):", error);
      alert("Search failed. Try again.");
    }
  }
};


  return (
    <header className="w-full px-4 sm:px-4 md:px-4 lg:px-10 py-4 border-b shadow-sm bg-teal-400">
      <div className="max-w-full flex justify-between items-center relative">
        {/* Left: Title */}
        <h1 className="text-2xl font-bold whitespace-nowrap">
          {t(" Inspector")}
        </h1>

        {/* Center: Search Bar */}
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <div className="relative w-80 sm:w-[22rem]">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleSearch}
              placeholder={t("Search...")}
              className="w-full pl-11 pr-4 py-3 text-base bg-white text-gray-900 border rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
          </div>
        </div>

        {/* Right: Language Toggle */}
        <Button
          onClick={toggleLanguage}
          variant="outline"
          size="sm"
          className="flex items-center gap-2 px-3 py-2 text-base"
        >
          <Languages className="w-5 h-5" />
        </Button>
      </div>
    </header>
  );
}
