"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, StopCircle, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { uploadFiles } from "@/lib/uploadthing";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

export default function VoiceRecorder({
  onUploadComplete,
}: {
  onUploadComplete: (url: string) => void;
}) {
  const [recording, setRecording] = useState(false);
  const [uploading, setUploading] = useState(false);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);

  // 🎙 Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorder.current = recorder;
      chunks.current = [];

      recorder.ondataavailable = (e) => chunks.current.push(e.data);

      recorder.onstop = async () => {
        const blob = new Blob(chunks.current, { type: "audio/webm" });
        await uploadAudio(blob);
      };

      recorder.start();
      setRecording(true);
      toast.success("Recording started 🎙️");
    } catch (err) {
      toast.error("Microphone permission denied");
      console.error("Error starting recording:", err);
    }
  };

  // ⏹ Stop recording → triggers upload
  const stopRecording = () => {
    mediaRecorder.current?.stop();
    setRecording(false);
    toast.success("Recording stopped, uploading...");
  };

  // ☁️ Upload audio directly via UploadThing
  const uploadAudio = async (audioBlob: Blob) => {
    setUploading(true);
    try {
      const file = new File([audioBlob], "voice-message.webm", {
        type: "audio/webm",
      });

      const res = await uploadFiles("postAudio", { files: [file] });

      const url = res?.[0]?.url;
      if (!url) throw new Error("Upload failed");

      toast.success("Voice message sent!");
      onUploadComplete(url); // auto-send after upload
    } catch (error) {
      console.error("Error uploading audio:", error);
      toast.error("Failed to upload voice");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Button
      variant={recording ? "destructive" : "ghost"}
      size="icon"
      onClick={recording ? stopRecording : startRecording}
      disabled={uploading}
      className="flex items-center justify-center"
    >
      {uploading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : recording ? (
        <StopCircle className="w-5 h-5" />
      ) : (
        <Mic className="w-5 h-5" />
      )}
    </Button>
  );
}
