import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { API_BASE_URL } from "@/constants/config";
import { toast } from "react-toastify";

export default function CreateProjectModal({ onCreate }) {
  const [name, setName] = useState("");
  const [open, setOpen] = useState(false);

  const token = localStorage.getItem("token");
  const selectedCompanyId = localStorage.getItem("selectedCompanyId");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${API_BASE_URL}/api/projects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          company: selectedCompanyId,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Project created!");
        onCreate(data.project); //  send saved project to parent
        setName("");
        setOpen(false);
      } else {
        toast.error(data.message || "Failed to create project.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className=" bg-green-500 text-white ">+ New Project</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Create New Project</DialogTitle>
        <DialogDescription>
          Enter the name of your new project.
        </DialogDescription>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <Input
            type="text"
            placeholder="Project Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Button type="submit" className="w-full">
            Create
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
