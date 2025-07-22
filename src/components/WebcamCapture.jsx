import React, { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const WebcamCapture = ({ open, setOpen, onCapture }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);

  useEffect(() => {
    if (open) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((currentStream) => {
          setStream(currentStream);
          if (videoRef.current) {
            videoRef.current.srcObject = currentStream;
          }
        })
        .catch((err) => {
          console.error("Camera access denied:", err);
          setOpen(false);
        });
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [open]);

  const handleCapture = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    if (!canvas || !video) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      const imageFile = new File([blob], `webcam-${Date.now()}.jpg`, {
        type: "image/jpeg",
      });
      onCapture(imageFile);
      setOpen(false);
    }, "image/jpeg");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md sm:max-w-lg">
        <DialogTitle>Live Camera</DialogTitle>
        <DialogDescription>Position your camera and take a photo.</DialogDescription>

        <div className="relative rounded-md overflow-hidden border border-gray-300">
          <video ref={videoRef} autoPlay playsInline className="w-full rounded" />
        </div>

        <canvas ref={canvasRef} className="hidden" />

        <div className="mt-4 flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleCapture} className="bg-indigo-600 text-white hover:bg-indigo-700">
            📸 Capture Photo
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WebcamCapture;
