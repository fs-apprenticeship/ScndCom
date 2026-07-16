"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// TypeScript's DOM library does not include the Web Speech API. This describes
// only the part of a recognition instance that this hook actually uses.
type BrowserSpeechRecognition = {
  abort: () => void;
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onend: (() => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onresult:
    | ((event: { results: ArrayLike<{ 0: { transcript: string } }> }) => void)
    | null;
  start: () => void;
  stop: () => void;
};

// Chrome still exposes the prefixed constructor, while other browsers may use
// the standard name. Both are optional because support is browser-dependent.
type SpeechWindow = Window & {
  SpeechRecognition?: new () => BrowserSpeechRecognition;
  webkitSpeechRecognition?: new () => BrowserSpeechRecognition;
};

// The hook reports completed transcripts and user-facing failures to its owner.
type UseSpeechRecognitionOptions = {
  onComplete: (transcript: string) => void;
  onError: (message: string) => void;
};

/** Owns a browser speech-recognition session and exposes dashboard-ready state. */
export function useSpeechRecognition({
  onComplete,
  onError,
}: UseSpeechRecognitionOptions) {
  // State is limited to values the dashboard renders.
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [transcript, setTranscript] = useState("");

  // Refs hold mutable recognition data that must survive renders without
  // causing new renders for every internal browser event.
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const transcriptRef = useRef("");
  const shouldCompleteRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  const onErrorRef = useRef(onError);

  // Recognition handlers outlive the render that created them. Refs keep
  // those handlers pointed at the latest dashboard callbacks.
  useEffect(() => {
    onCompleteRef.current = onComplete;
    onErrorRef.current = onError;
  }, [onComplete, onError]);

  // Detect support after hydration and abort any active browser session when
  // the dashboard unmounts.
  useEffect(() => {
    const speechWindow = window as SpeechWindow;
    const timeout = window.setTimeout(() => {
      setIsSupported(
        Boolean(
          speechWindow.SpeechRecognition ??
          speechWindow.webkitSpeechRecognition,
        ),
      );
    }, 0);

    return () => {
      window.clearTimeout(timeout);
      shouldCompleteRef.current = false;
      recognitionRef.current?.abort();
    };
  }, []);

  /** Starts a fresh recognition instance and wires its browser event handlers. */
  const startListening = useCallback(() => {
    const speechWindow = window as SpeechWindow;
    const Recognition =
      speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
    if (!Recognition) {
      setIsSupported(false);
      onErrorRef.current(
        "Speech recognition is not supported in this browser. Type your request instead.",
      );
      return;
    }

    const recognition = new Recognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    transcriptRef.current = "";
    // onend also fires after errors and aborts. This flag ensures only a
    // deliberate or natural stop opens transcript review.
    shouldCompleteRef.current = true;
    setTranscript("");
    setIsListening(true);

    // Interim results update the visible transcript while the user is talking.
    recognition.onresult = (event) => {
      const nextTranscript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join("")
        .trimStart();
      transcriptRef.current = nextTranscript;
      setTranscript(nextTranscript);
    };
    // Errors stop completion so onend cannot open a misleading review dialog.
    recognition.onerror = (event) => {
      shouldCompleteRef.current = false;
      setIsListening(false);
      onErrorRef.current(getErrorMessage(event.error));
    };
    // Natural silence and manual stops both finish through onend. This is the
    // single place that hands a completed transcript back to the dashboard.
    recognition.onend = () => {
      recognitionRef.current = null;
      setIsListening(false);
      if (!shouldCompleteRef.current) return;
      shouldCompleteRef.current = false;
      const completedTranscript = transcriptRef.current.trim();
      if (completedTranscript) {
        onCompleteRef.current(completedTranscript);
      } else {
        onErrorRef.current(
          "No speech was detected. Try again or type your request.",
        );
      }
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch {
      recognitionRef.current = null;
      shouldCompleteRef.current = false;
      setIsListening(false);
      onErrorRef.current(
        "Speech recognition could not start. Type your request instead.",
      );
    }
  }, []);

  /** Stops the active session while preserving its transcript for completion. */
  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  return {
    isListening,
    isSupported,
    startListening,
    stopListening,
    transcript,
  };
}

/** Converts browser speech error codes into actionable dashboard messages. */
function getErrorMessage(error: string) {
  if (error === "not-allowed" || error === "service-not-allowed") {
    return "Microphone access was denied. You can still type your request.";
  }
  if (error === "no-speech") {
    return "No speech was detected. Try again or type your request.";
  }
  return "Speech recognition stopped unexpectedly. Try again or type your request.";
}
