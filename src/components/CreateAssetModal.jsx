import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-toastify";
import { API_BASE_URL } from "@/constants/config";
import WebcamCapture from "./WebcamCapture";
import ManagePhotosDialog from "./ManagePhotosDialog";

const CreateAssetModal = ({
  open,
  setOpen,
  folderId,
  userId,
  projectId,
  onCreated,
}) => {
  const [step, setStep] = useState(1);
  const [images, setImages] = useState([]);
  const [showWebcam, setShowWebcam] = useState(false);
  const [showManage, setShowManage] = useState(false);
  const [assetName, setAssetName] = useState("");
  const [writtenDescription, setWrittenDescription] = useState("");
  const [transcribedText, setTranscribedText] = useState("");
  const [recognition, setRecognition] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const handleWebcamCapture = (file) => {
    setImages((prev) => [...prev, file]);
    toast.success("📸 Photo captured from webcam");
  };

  const handleGalleryUpload = (e) => {
    const files = Array.from(e.target.files);
    setImages((prev) => [...prev, ...files]);
    toast.success(`${files.length} photo(s) selected from gallery`);
  };

  const handleNext = () => {
    if (images.length === 0) {
      toast.warning("Please add at least one photo before proceeding.");
      return;
    }
    setStep(2);
  };

  const handleNameSubmit = () => {
    if (!assetName.trim()) {
      toast.warning("Please enter an asset name.");
      return;
    }
    setStep(3);
  };

  const handleVoiceToggle = async () => {
  if (mediaRecorderRef.current) {
    mediaRecorderRef.current.stop();
    mediaRecorderRef.current = null;
    if (recognition) {
      recognition.stop();
      setRecognition(null);
    }
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    audioChunksRef.current = [];

    setTranscribedText(""); // ✅ Clear previous transcription

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) audioChunksRef.current.push(event.data);
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      setAudioBlob(blob);
      setAudioUrl(URL.createObjectURL(blob));
      audioChunksRef.current = [];
    };

    mediaRecorder.start();

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recog = new SpeechRecognition();
      recog.continuous = true;
      recog.interimResults = true;
      recog.lang = "en-US";

      recog.onresult = (event) => {
        let finalTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + " ";
          }
        }
        setTranscribedText(finalTranscript); // ✅ Replace instead of appending
      };

      recog.start();
      setRecognition(recog);
    }
  } catch (error) {
    console.error("Microphone access denied:", error);
    toast.error("Microphone access denied");
  }
};


  const handleFinish = async () => {
  if (!writtenDescription && !transcribedText) {
    toast.warning("Add either a voice or written description.");
    return;
  }

  toast.info("⏳ Creating asset, please wait...", {
    autoClose: false,
    toastId: "creating-asset",
  });

  try {
    const token = localStorage.getItem("token");

    const uploadedPhotos = [];
    for (const file of images) {
      const base64 = await toBase64(file);
      const res = await fetch(`${API_BASE_URL}/api/upload/photo`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ base64 }),
      });

      if (!res.ok) throw new Error("Photo upload failed");
      const data = await res.json();
      uploadedPhotos.push(data.url);
    }

    let voiceNoteUrl = null;
    if (audioBlob) {
      const voiceBase64 = await toBase64(audioBlob);
      const res = await fetch(`${API_BASE_URL}/api/upload/voice`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ base64: voiceBase64 }),
      });

      if (!res.ok) throw new Error("Voice upload failed");
      const data = await res.json();
      voiceNoteUrl = data.url;
    }

    const assetPayload = {
      name: assetName,
      folderId,
      projectId,
      photos: uploadedPhotos,
      voiceNoteUrl,
      voiceToText: transcribedText,
      textDescription: writtenDescription,
    };

    const saveRes = await fetch(`${API_BASE_URL}/api/assets`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(assetPayload),
    });

    if (!saveRes.ok) throw new Error("Asset save failed");

    const newAsset = await saveRes.json();
    toast.success(" Asset saved successfully!");
    if (typeof onCreated === "function") onCreated(newAsset);

    setStep(1);
    setImages([]);
    setAssetName("");
    setWrittenDescription("");
    setTranscribedText("");
    setAudioBlob(null);
    setAudioUrl(null);
    setRecognition(null);
    setOpen(false);
  } catch (err) {
    console.error("Error saving asset:", err);
    toast.error("❌ Failed to save asset");
  } finally {
    toast.dismiss("creating-asset");
  }
};


  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (err) => reject(err);
    });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md sm:max-w-lg">
        {step === 1 && (
          <>
            <DialogTitle>Step 1: Capture Photos</DialogTitle>
            <DialogDescription className="text-sm mb-3">
              Add Photos for:{" "}
              <span className="text-blue-600 font-semibold underline cursor-pointer">
                Unnamed Asset
              </span>{" "}
              <span className="text-gray-500 text-xs">(for folder)</span>
            </DialogDescription>

            <div className="flex flex-col sm:flex-row gap-4 w-full mb-4">
              <Button
                type="button"
                onClick={() => setShowWebcam(true)}
                variant="outline"
                className="w-full sm:w-1/2 flex items-center justify-center gap-2"
              >
                📸 Take Photos (Camera)
              </Button>

              <label className="w-full sm:w-1/2">
                <div className="border border-gray-300 rounded-md px-4 py-2 text-sm flex items-center justify-center gap-2 cursor-pointer hover:bg-gray-50">
                  🖼️ Upload from Gallery
                </div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleGalleryUpload}
                  className="hidden"
                />
              </label>
            </div>

            {images.length > 0 && (
              <div className="border border-gray-200 rounded-md bg-gray-50 p-3 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm text-gray-700 font-medium">
                    Photos Added ({images.length})
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-sm"
                    onClick={() => setShowManage(true)}
                  >
                    ✏️ Manage Photos
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {images.map((img, i) => (
                    <img
                      key={i}
                      src={URL.createObjectURL(img)}
                      alt={`preview-${i}`}
                      className="w-16 h-16 rounded object-cover border"
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleNext}
                disabled={images.length === 0}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                Next: Asset Name →
              </Button>
            </div>

            <WebcamCapture
              open={showWebcam}
              setOpen={setShowWebcam}
              onCapture={handleWebcamCapture}
            />
            <ManagePhotosDialog
              open={showManage}
              setOpen={setShowManage}
              images={images}
              setImages={setImages}
            />
          </>
        )}

        {step === 2 && (
          <div>
            <DialogTitle>Step 2: Asset Name</DialogTitle>
            <DialogDescription className="text-sm mb-3">
              Provide a name for your asset.
            </DialogDescription>

            <Input
              placeholder="e.g., Main Entrance Column"
              value={assetName}
              onChange={(e) => setAssetName(e.target.value)}
              className="mb-4"
            />

            <div className="flex justify-between">
              <Button onClick={() => setStep(1)} variant="outline">
                ← Back
              </Button>
              <Button
                onClick={handleNameSubmit}
                disabled={!assetName.trim()}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                Next: Add Descriptions →
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <DialogTitle>Step 3: Descriptions & Save</DialogTitle>
            <p className="text-sm text-gray-500 mb-4">
              Add Details for:{" "}
              <span className="text-blue-600">{assetName}</span>
            </p>

            <label className="block mb-1 text-sm font-medium text-gray-700">
              Voice Description
            </label>
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <Button
                onClick={handleVoiceToggle}
                className={`w-full sm:w-1/2 text-white ${
                  mediaRecorderRef.current
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-gray-800 hover:bg-gray-900"
                }`}
              >
                🎙️{" "}
                {mediaRecorderRef.current ? "Finish Recording" : "Record Voice"}
              </Button>

              <Button
                disabled={!audioUrl}
                onClick={() => audioUrl && new Audio(audioUrl).play()}
                className="w-full sm:w-1/2 bg-fuchsia-600 hover:bg-fuchsia-700 text-white"
              >
                ▶️ Play Audio
              </Button>
            </div>

            <label className="block mb-1 text-sm font-medium text-gray-700">
              Auto-transcribed Description
            </label>
            <textarea
              className="w-full border border-gray-300 rounded px-4 py-2 mb-3"
              rows={2}
              value={transcribedText}
              readOnly
            />

            <label className="block mb-1 text-sm font-medium text-gray-700">
              Written Description
            </label>
            <textarea
              className="w-full border border-gray-300 rounded px-4 py-2"
              rows={3}
              value={writtenDescription}
              onChange={(e) => setWrittenDescription(e.target.value)}
              placeholder="Type detailed written description here..."
            />

            <div className="flex justify-between mt-5">
              <Button onClick={() => setStep(2)}>← Back</Button>
              <Button
                onClick={handleFinish}
                className="bg-indigo-600 text-white"
              >
                Finish
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CreateAssetModal;
