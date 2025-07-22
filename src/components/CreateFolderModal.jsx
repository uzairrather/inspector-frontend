import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { API_BASE_URL } from "@/constants/config";

export default function CreateFolderModal({
  projectId,
  parentId = null,         // ✅ NEW: optional prop
  onCreated,
  open,
  setOpen,
}) {
  const [name, setName] = useState("");

  const handleCreate = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    const company =
      localStorage.getItem("selectedCompanyId") ||
      localStorage.getItem("companyId");

    if (!token || !company || !projectId || !name) {
      toast.error("Missing required fields");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/folders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          project: projectId,
          company,
          parent: parentId || null, // ✅ Include parent only if provided
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(" Folder created");
        onCreated(data); // Append to UI
        setOpen(false);
        setName("");
      } else {
        toast.error(data.message || "Failed to create folder");
      }
    } catch (err) {
      console.error("❌ Folder creation error:", err);
      toast.error("Server error");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogTitle>Add Folder</DialogTitle>
        <DialogDescription>Give a name to your new folder</DialogDescription>
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            placeholder="Folder name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Button type="submit" className="w-full">
            Create Folder
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
