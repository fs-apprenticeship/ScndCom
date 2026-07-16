"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import { useState } from "react";

import { useCalendar } from "@/features/calendar/hooks/use-calendar";
import { useGDoc } from "@/features/gdoc/hooks/use-gdoc";
import { IntentType, parseIntent } from "@/lib/intent/parse-intent";

import type { DashboardErrorData } from "./dashboard-error";

import { CalendarEventDialog } from "./calendar-event-dialog";
import { DashboardError } from "./dashboard-error";
import { TranscriptDialog } from "./transcript-dialog";
import { useSpeechRecognition } from "./use-speech-recognition";
import { VoiceCapture } from "./voice-capture";
import { VoiceWaveform } from "./voice-waveform";

/** Coordinates speech capture, intent routing, and feature-specific workflows. */
export function VoiceDashboard() {
  // Feature hooks own their API requests and lifecycle state. The dashboard
  // coordinates them after intent classification.
  const { isSignedIn } = useUser();
  const calendar = useCalendar();
  const gdoc = useGDoc();

  const [draftTranscript, setDraftTranscript] = useState("");
  const [dashboardError, setDashboardError] =
    useState<DashboardErrorData | null>(null);
  const [isClassifying, setIsClassifying] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);

  /** Opens transcript review with the completed browser speech result. */
  function handleSpeechComplete(transcript: string) {
    setDraftTranscript(transcript);
    setReviewOpen(true);
  }

  /** Surfaces a browser speech-recognition failure on the dashboard. */
  function handleSpeechError(description: string) {
    setDashboardError({
      description,
      title: "Speech recognition unavailable",
    });
  }

  const speech = useSpeechRecognition({
    onComplete: handleSpeechComplete,
    onError: handleSpeechError,
  });

  const isProcessing = isClassifying || calendar.loading || gdoc.loading;

  /** Closes transcript review and clears any related clarification state. */
  function resetTranscript() {
    setDraftTranscript("");
    setReviewOpen(false);
    if (calendar.clarificationNeeded) calendar.reset();
  }

  /** Opens a blank transcript dialog for typed input. */
  function openTypedTranscript() {
    setDashboardError(null);
    setDraftTranscript("");
    setReviewOpen(true);
  }

  /** Clears previous results and starts a new speech-recognition session. */
  function startListening() {
    setDashboardError(null);
    calendar.reset();
    gdoc.reset();
    speech.startListening();
  }

  /** Classifies the reviewed transcript and sends it to the matching feature. */
  async function confirmTranscript() {
    const transcript = draftTranscript.trim();
    if (!transcript || isProcessing) return;

    setIsClassifying(true);
    setDashboardError(null);
    setReviewOpen(false);
    calendar.reset();
    gdoc.reset();

    try {
      const result = await parseIntent(transcript);

      if (result.intent === IntentType.GDoc) {
        await gdoc.createGDoc(transcript);
        return;
      }

      if (result.intent === IntentType.Calendar) {
        await calendar.parseCalendarIntent(transcript);
        return;
      }

      if (result.intent === IntentType.Mail) {
        // await mail.function(transcript);
        return;
      }
    } catch (error) {
      setDashboardError({
        description: error instanceof Error ? error.message : String(error),
        title: "Could not process request",
      });
    } finally {
      setIsClassifying(false);
    }
  }

  /** Creates the currently reviewed calendar event. */
  async function confirmCalendarEvent() {
    if (!calendar.pendingAction || calendar.loading) return;
    await calendar.confirmEvent();
  }

  /** Cancels calendar confirmation and clears its transcript. */
  function cancelCalendarEvent() {
    calendar.reset();
    setDraftTranscript("");
  }

  /** Keeps transcript state synchronized with dialog open and close actions. */
  function handleTranscriptDialogOpenChange(open: boolean) {
    if (!open && !isClassifying) resetTranscript();
    setReviewOpen(open);
  }

  let displayedError = dashboardError;
  if (!displayedError && gdoc.error) {
    displayedError = {
      description: gdoc.error,
      title: "Could not create document",
    };
  } else if (!displayedError && calendar.error && !calendar.pendingAction) {
    displayedError = {
      description: calendar.error,
      title: "Could not prepare calendar event",
    };
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 pt-6 sm:px-10 sm:pt-10 lg:px-16">
        <header className="flex w-full items-center justify-between">
          <span className="font-bold text-sm tracking-[0.12em]">SCNDCOM</span>
          {isSignedIn && <UserButton />}
        </header>

        <div className="mt-5 sm:mt-8">
          <VoiceWaveform isListening={speech.isListening} />
        </div>

        <VoiceCapture
          isListening={speech.isListening}
          isProcessing={isProcessing}
          isSupported={speech.isSupported}
          onStartListening={startListening}
          onStopListening={speech.stopListening}
          onTypeRequest={openTypedTranscript}
          transcript={speech.transcript}
        />

        {gdoc.doc?.url && !displayedError && (
          <div className="mt-2 text-center">
            <a
              className="font-medium text-primary text-sm underline underline-offset-4"
              href={gdoc.doc.url}
              rel="noreferrer"
              target="_blank"
            >
              Open {gdoc.doc.content.title}
            </a>
          </div>
        )}

        {displayedError && <DashboardError {...displayedError} />}
      </div>

      <TranscriptDialog
        clarificationNeeded={calendar.clarificationNeeded}
        disabled={isClassifying}
        onCancel={resetTranscript}
        onConfirm={confirmTranscript}
        onOpenChange={handleTranscriptDialogOpenChange}
        onTranscriptChange={setDraftTranscript}
        open={reviewOpen || calendar.clarificationNeeded}
        transcript={draftTranscript}
      />

      <CalendarEventDialog
        action={calendar.pendingAction}
        error={calendar.error}
        loading={calendar.loading}
        onCancel={cancelCalendarEvent}
        onConfirm={confirmCalendarEvent}
      />
    </main>
  );
}
