import { KeyboardIcon, MicIcon, SquareIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type VoiceCaptureProps = {
  isListening: boolean;
  isProcessing: boolean;
  isSupported: boolean;
  onStartListening: () => void;
  onStopListening: () => void;
  onTypeRequest: () => void;
  transcript: string;
};

/** Presents speech capture controls and the typed-input fallback. */
export function VoiceCapture({
  isListening,
  isProcessing,
  isSupported,
  onStartListening,
  onStopListening,
  onTypeRequest,
  transcript,
}: Readonly<VoiceCaptureProps>) {
  return (
    <TooltipProvider>
      <section className="flex min-h-64 flex-col items-center justify-center text-center">
        <Badge className="mb-5 px-3 py-1" variant="secondary">
          SCNDCOM Assistant
        </Badge>

        {isListening ? (
          <div className="flex min-h-24 max-w-3xl items-center justify-center px-4">
            <p className="text-pretty text-xl leading-relaxed sm:text-2xl">
              {transcript || "Listening…"}
              <span className="ml-1 inline-block h-5 w-0.5 animate-pulse bg-primary align-middle" />
            </p>
          </div>
        ) : (
          <div className="min-h-24">
            <h1 className="font-semibold text-3xl tracking-tight sm:text-5xl">
              Voice Assistant
            </h1>
            <p className="mt-3 text-muted-foreground sm:text-lg">
              Tap the mic and speak your request
            </p>
          </div>
        )}

        <div className="mt-5 flex flex-col items-center gap-5">
          <div className="relative flex size-24 items-center justify-center">
            {isListening && (
              <>
                <span className="absolute size-20 animate-[dashboard-mic-pulse_1.7s_ease-out_infinite] rounded-full bg-primary/20 motion-reduce:animate-none" />
                <span className="absolute size-20 animate-[dashboard-mic-pulse_1.7s_ease-out_0.6s_infinite] rounded-full bg-primary/15 motion-reduce:animate-none" />
              </>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  aria-label={
                    isListening ? "Stop listening" : "Start listening"
                  }
                  className={cn(
                    "relative z-10 size-17 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95",
                    isListening && "size-17",
                  )}
                  disabled={isProcessing}
                  onClick={isListening ? onStopListening : onStartListening}
                >
                  {isProcessing ? (
                    <Spinner className="size-6" />
                  ) : isListening ? (
                    <SquareIcon className="size-5 fill-current" />
                  ) : (
                    <MicIcon className="size-7" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isListening ? "Stop listening" : "Start listening"}
              </TooltipContent>
            </Tooltip>
          </div>

          <Button
            disabled={isListening || isProcessing}
            onClick={onTypeRequest}
            size="sm"
            variant="ghost"
          >
            <KeyboardIcon data-icon="inline-start" />
            {isSupported ? "Type instead" : "Type your request"}
          </Button>
        </div>
      </section>
    </TooltipProvider>
  );
}
