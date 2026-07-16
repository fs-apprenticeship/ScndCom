import { cn } from "@/lib/utils";

// Generate a stable range of bar heights once. Animation scales these shapes,
// which avoids random layout changes every time React renders the dashboard.
const BARS = Array.from({ length: 64 }, (_, index) => {
  const wave = Math.abs(Math.sin(index * 0.47) * Math.cos(index * 0.19));
  return Math.round(18 + wave * 104);
});

type VoiceWaveformProps = {
  isListening: boolean;
};

/** Renders the decorative waveform for the dashboard's idle and listening states. */
export function VoiceWaveform({ isListening }: Readonly<VoiceWaveformProps>) {
  return (
    <div
      aria-hidden="true"
      className="flex h-40 w-full items-center justify-center gap-1 overflow-hidden sm:h-52 sm:gap-1.5"
    >
      {BARS.map((height, index) => (
        <span
          className={cn(
            "block w-1 shrink-0 rounded-full bg-primary motion-reduce:animate-none sm:w-1.5",
            // Listening changes only the animation intensity. The waveform is
            // decorative and does not claim to represent microphone volume.
            isListening
              ? "animate-[dashboard-wave-listening_0.7s_ease-in-out_infinite_alternate]"
              : "animate-[dashboard-wave-idle_2.4s_ease-in-out_infinite_alternate] opacity-45",
          )}
          key={index}
          style={{
            animationDelay: `${(index % 11) * -0.09}s`,
            height: `${height}px`,
          }}
        />
      ))}
    </div>
  );
}
