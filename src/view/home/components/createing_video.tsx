"use client";

import { useEffect, useState } from "react";

interface GeneratingVideoViewProps {
  onComplete: () => void;
}

const steps = [
  "Analyzing your image",
  "Making it stunning",
  "Generating",
];

export default function GeneratingVideoView({
  onComplete,
}: GeneratingVideoViewProps) {
  const [progresses, setProgresses] = useState<number[]>(
    steps.map(() => 0)
  );

  useEffect(() => {
    let currentStep = 0;
    let progress = 0;

    const interval = setInterval(() => {
      progress += 2;

      setProgresses((prev) => {
        const next = [...prev];
        next[currentStep] = Math.min(progress, 100);
        return next;
      });

      if (progress >= 100) {
        if (currentStep === steps.length - 1) {
          clearInterval(interval);

          // Đợi UI update một chút rồi callback
          setTimeout(() => {
            onComplete();
          }, 300);

          return;
        }

        currentStep += 1;
        progress = 0;
      }
    }, 50);

    return () => {
      clearInterval(interval);
    };
  }, [onComplete]);

  return (
    <div className="h-screen w-full overflow-hidden bg-black text-white">
      <div className="mx-auto flex h-screen w-full max-w-[430px] flex-col px-5">

        {/* Header */}
        <header className="flex h-16 shrink-0 items-center">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white">
              <span className="text-lg font-bold text-black">
                S
              </span>
            </div>

            <span className="text-xl font-semibold tracking-tight">
              Seevid
            </span>
          </div>
        </header>

        {/* Content */}
        <main className="flex min-h-0 flex-1 flex-col">

          {/* Title */}
          <div className="shrink-0 pt-8 pb-6">
            <h1 className="text-3xl font-bold leading-tight">
              Generating your video...
            </h1>

            <p className="mt-2 text-sm text-white/50">
              This may take a few moments.
            </p>
          </div>

          {/* Video */}
          <div className="flex min-h-0 flex-1 items-center justify-center">
            <div className="w-full max-w-[320px] overflow-hidden rounded-2xl">
              <video
                className="mx-auto block max-h-full w-full object-contain"
                src="https://aistudio.picify.net/images/290006/thumb_450x800/290006.mp4"
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
              />
            </div>
          </div>

          {/* Progress */}
          <div className="shrink-0 space-y-5 py-6">
            {steps.map((step, index) => {
              const progress = progresses[index];

              return (
                <div key={step}>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {step}
                    </span>

                    <span className="text-xs text-white/50">
                      {progress}%
                    </span>
                  </div>

                  <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-white transition-[width] duration-75 ease-linear"
                      style={{
                        width: `${progress}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

        </main>
      </div>
    </div>
  );
}