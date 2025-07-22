import React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { X } from "lucide-react";

const ManagePhotosDialog = ({ open, setOpen, images, setImages }) => {
  const handleRemove = (index) => {
    const updated = [...images];
    updated.splice(index, 1);
    setImages(updated);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md sm:max-w-lg">
        <DialogTitle>Manage Photos for Asset: <span className="text-blue-600 underline cursor-pointer">Unnamed Asset</span></DialogTitle>
        <DialogDescription className="text-sm mb-4">
          Add more photos using your camera or gallery, or remove existing ones from the batch.
        </DialogDescription>

        <div className="flex flex-wrap gap-4">
          {images.map((file, index) => (
            <div key={index} className="relative w-24 h-24 rounded overflow-hidden border">
              <img
                src={URL.createObjectURL(file)}
                alt={`photo-${index}`}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => handleRemove(index)}
                className="absolute top-0 right-0 bg-red-500 text-white w-5 h-5 text-xs flex items-center justify-center rounded-full"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ManagePhotosDialog;
