"use client";

import { useRef, useState } from "react";

import type { TranscribeVoiceEmailResult } from "@/features/gmail/lib/voice-email-schema";

const MIN_RECORDING_MS = 500;

type PushToSpeakButtonProps = {
  disabled?: boolean;
  onError: (message: null | string) => void;
  onResult: (result: TranscribeVoiceEmailResult) => void;
};

type TranscribeResponse = Partial<TranscribeVoiceEmailResult> & {
  error?: string;
};

export default function PushToSpeakButton({
  disabled = false,
  onError,
  onResult,
}: PushToSpeakButtonProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const chunksRef = useRef<Blob[]>([]);
  const isRecordingRef = useRef(false);
  const isStartingRef = useRef(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mimeTypeRef = useRef("");
  const recordingStartedAtRef = useRef(0);
  const shouldStopAfterStartRef = useRef(false);
  const streamRef = useRef<MediaStream | null>(null);

  function stopTracks() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }

  async function transcribeRecording(blob: Blob, mimeType: string) {
    setIsTranscribing(true);

    try {
      const extension = getFileExtension(mimeType);
      const fileType = mimeType.split(";")[0] ?? mimeType;
      const formData = new FormData();
      formData.append(
        "audio",
        new File([blob], `recording.${extension}`, { type: fileType }),
      );

      const response = await fetch("/api/gmail/transcribe", {
        body: formData,
        method: "POST",
      });
      const payload = (await response.json()) as TranscribeResponse;

      if (!response.ok) {
        onError(payload.error ?? "Unable to transcribe voice input.");
        return;
      }

      if (!payload.fields) {
        onError("Unable to transcribe voice input.");
        return;
      }

      onResult({
        fields: payload.fields,
        transcript: payload.transcript ?? "",
      });
    } catch {
      onError("Unable to transcribe voice input. Try again.");
    } finally {
      setIsTranscribing(false);
    }
  }

  function finishRecording() {
    const recorder = mediaRecorderRef.current;

    if (!recorder || recorder.state === "inactive") {
      return;
    }

    recorder.stop();
    mediaRecorderRef.current = null;
    isRecordingRef.current = false;
    setIsRecording(false);
  }

  async function startRecording(pointerId: number, target: EventTarget) {
    if (
      disabled ||
      isTranscribing ||
      isRecordingRef.current ||
      isStartingRef.current
    ) {
      return;
    }

    onError(null);
    isStartingRef.current = true;
    shouldStopAfterStartRef.current = false;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          autoGainControl: true,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      const mimeType = getSupportedMimeType();

      if (!mimeType) {
        stopTracks();
        onError("This browser does not support audio recording.");
        return;
      }

      if (!(target instanceof Element)) {
        stopTracks();
        return;
      }

      target.setPointerCapture(pointerId);

      const recorder = new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];
      mimeTypeRef.current = mimeType;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        stopTracks();

        const recordedMs = Date.now() - recordingStartedAtRef.current;
        const blob = new Blob(chunksRef.current, {
          type: mimeTypeRef.current.split(";")[0],
        });

        if (recordedMs < MIN_RECORDING_MS) {
          onError("Hold the button a little longer while you speak.");
          return;
        }

        if (blob.size < 500) {
          onError("No audio was captured. Try holding the button longer.");
          return;
        }

        void transcribeRecording(blob, mimeTypeRef.current);
      };

      streamRef.current = stream;
      mediaRecorderRef.current = recorder;
      recordingStartedAtRef.current = Date.now();
      recorder.start(250);
      isRecordingRef.current = true;
      setIsRecording(true);

      if (shouldStopAfterStartRef.current) {
        shouldStopAfterStartRef.current = false;
        finishRecording();
      }
    } catch {
      stopTracks();
      onError("Microphone access is required to dictate an email.");
    } finally {
      isStartingRef.current = false;
    }
  }

  function stopRecording() {
    if (isStartingRef.current) {
      shouldStopAfterStartRef.current = true;
      return;
    }

    if (!isRecordingRef.current) {
      return;
    }

    finishRecording();
  }

  function releasePointer(event: React.PointerEvent<HTMLButtonElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    stopRecording();
  }

  const buttonLabel = isTranscribing
    ? "Transcribing..."
    : isRecording
      ? "Listening..."
      : "Hold to speak";

  return (
    <div className="space-y-2">
      <button
        aria-pressed={isRecording}
        className="inline-flex touch-none select-none items-center justify-center rounded-md border border-dashed px-4 py-2.5 text-sm font-medium disabled:opacity-60 data-[recording=true]:border-destructive data-[recording=true]:text-destructive"
        data-recording={isRecording}
        disabled={disabled || isTranscribing}
        onPointerCancel={releasePointer}
        onPointerDown={(event) => {
          event.preventDefault();
          void startRecording(event.pointerId, event.currentTarget);
        }}
        onPointerUp={releasePointer}
        type="button"
      >
        {buttonLabel}
      </button>
      <p className="text-sm text-muted-foreground">
        Press and hold the button for at least half a second. Voice template:
        email frank@example.com, subject team lunch, body hey are we still
        meeting tomorrow? Review the fields, then press Send email.
      </p>
    </div>
  );
}

function getFileExtension(mimeType: string) {
  if (mimeType.includes("mp4")) {
    return "mp4";
  }

  if (mimeType.includes("ogg")) {
    return "ogg";
  }

  return "webm";
}

function getSupportedMimeType() {
  const preferredTypes = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/ogg;codecs=opus",
  ];

  return preferredTypes.find((type) => MediaRecorder.isTypeSupported(type));
}
