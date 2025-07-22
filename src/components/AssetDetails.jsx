import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "@/constants/config";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";

const AssetDetails = () => {
  const { assetId } = useParams();
  const navigate = useNavigate();
  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [writtenDescription, setWrittenDescription] = useState("");
  const [transcribedText, setTranscribedText] = useState("");
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    const fetchAsset = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE_URL}/api/assets/id/${assetId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch asset");

        const data = await res.json();
        setAsset(data);
        setEditedName(data.name);
        setWrittenDescription(data.textDescription || "");
        setTranscribedText(data.voiceToText || "");
        setAudioUrl(data.voiceNoteUrl || null);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load asset details");
      } finally {
        setLoading(false);
      }
    };

    fetchAsset();
  }, [assetId]);

  const handleVoiceToggle = async () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

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
    } catch (error) {
      console.error("Microphone access denied:", error);
      toast.error("Microphone access denied");
    }
  };

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (err) => reject(err);
    });

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      const token = localStorage.getItem("token");

      let voiceNoteUrl = asset.voiceNoteUrl;
      if (audioBlob) {
        const base64 = await toBase64(audioBlob);
        const res = await fetch(`${API_BASE_URL}/api/upload/voice`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ base64 }),
        });

        const data = await res.json();
        voiceNoteUrl = data.url;
      }

      const updatedPayload = {
        name: editedName,
        textDescription: writtenDescription,
        voiceToText: transcribedText,
        voiceNoteUrl,
      };

      const res = await fetch(`${API_BASE_URL}/api/assets/id/${assetId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedPayload),
      });

      if (!res.ok) throw new Error("Update failed");

      const updated = await res.json();
      setAsset(updated);
      toast.success("Asset updated successfully");
    } catch (err) {
      console.error("Error updating asset:", err);
      toast.error("Failed to update asset");
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (!asset) return <div className="p-6 text-red-600">Asset not found</div>;

  return (
    <div className="min-h-screen bg-[#f4f6ff] p-6">
      <Button onClick={() => navigate(-1)} className="mb-4">
        ← Back to Folder
      </Button>

      <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-md border border-gray-200">
        <h2 className="text-2xl font-bold mb-2">
          Edit Details for: <span className="text-blue-700">{asset.name}</span>
        </h2>
        <p className="text-sm text-gray-500 mb-4">Step 3: Descriptions</p>

        {/* Name */}
        <div className="mb-4">
          <label className="block font-medium mb-1">Asset Name</label>
          <input
            className="w-full border border-gray-300 rounded px-4 py-2"
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
          />
        </div>

        {/* Photos */}
        <div className="mb-4">
          <label className="font-medium">
            Media Added ({asset.photos.length})
          </label>
          <div className="flex flex-wrap gap-3 mt-2">
            {asset.photos.map((url, index) => (
              <img
                key={index}
                src={url}
                alt={`photo-${index}`}
                className="w-24 h-24 object-cover rounded border"
              />
            ))}
          </div>
        </div>

        {/* Voice */}
        <div className="mb-4">
          <label className="font-medium block mb-1">Voice Description</label>
          <div className="flex gap-3">
            <Button
              onClick={handleVoiceToggle}
              className="bg-gray-900 text-white"
            >
              🎙️ {mediaRecorderRef.current ? "Stop" : "Record Voice"}
            </Button>
            <Button
              disabled={!audioUrl}
              onClick={() => audioUrl && new Audio(audioUrl).play()}
              className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white"
            >
              ▶️ Play Audio
            </Button>
          </div>
        </div>

        {/* Transcribed */}
        <div className="mb-4">
          <label className="block font-medium mb-1">
            Auto-transcribed Description
          </label>
          <textarea
            className="w-full border border-gray-300 rounded px-4 py-2"
            rows={2}
            value={transcribedText}
            onChange={(e) => setTranscribedText(e.target.value)}
          />
        </div>

        {/* Written */}
        <div className="mb-4">
          <label className="block font-medium mb-1">Written Description</label>
          <textarea
            className="w-full border border-gray-300 rounded px-4 py-2"
            rows={3}
            value={writtenDescription}
            onChange={(e) => setWrittenDescription(e.target.value)}
          />
        </div>

        <Button
          onClick={handleUpdate}
          disabled={isUpdating}
          className="bg-indigo-600 text-white"
        >
          {isUpdating ? "Updating..." : "Update Asset"}
        </Button>
      </div>
    </div>
  );
};

export default AssetDetails;
