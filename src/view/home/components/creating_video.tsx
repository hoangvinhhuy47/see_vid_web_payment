"use client";

import { useEffect, useState } from "react";

interface GeneratingVideoViewProps {
  onComplete: () => void;
}

const steps = ["Analyzing your image", "Making it stunning", "Generating"];
const PROGRESS_INCREMENT = 2;
const PROGRESS_INTERVAL_MS = 50;
const COMPLETION_DELAY_MS = 300;

export default function GeneratingVideoView({
  onComplete,
}: GeneratingVideoViewProps) {
  const [progresses, setProgresses] = useState<number[]>(() => steps.map(() => 0));

  useEffect(() => {
    let currentStep = 0;
    let progress = 0;
    let completionTimeout: ReturnType<typeof setTimeout> | undefined;

    const interval = setInterval(() => {
      progress = Math.min(progress + PROGRESS_INCREMENT, 100);
      const stepIndex = currentStep;
      const stepProgress = progress;

      setProgresses((previous) =>
        previous.map((value, index) =>
          index === stepIndex ? stepProgress : value,
        ),
      );

      if (progress < 100) return;

      if (currentStep === steps.length - 1) {
        clearInterval(interval);
        completionTimeout = setTimeout(onComplete, COMPLETION_DELAY_MS);
        return;
      }

      currentStep += 1;
      progress = 0;
    }, PROGRESS_INTERVAL_MS);

    return () => {
      clearInterval(interval);
      clearTimeout(completionTimeout);
    };
  }, [onComplete]);

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden text-white">
      <div className="shrink-0 pb-4">
        <h1 className="text-center text-xl font-bold sm:text-2xl">
          Creating your perfect love story
        </h1>

        <p className="mt-2 text-center text-sm text-white/50">
          We are putting the final touches
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden rounded-2xl">
        <video
          className="h-full w-full object-cover"
          src="https://aistudio.picify.net/images/290006/thumb_450x800/290006.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        />
      </div>

      <div className="shrink-0 space-y-3 pt-4">
        {steps.map((step, index) => {
          const progress = progresses[index];

          return (
            <div key={step}>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm text-white/50">{step}</span>

                <span className="text-xs text-white/50">{progress}%</span>
              </div>

              <div className="h-1 w-full overflow-hidden rounded-full bg-[#F19EC0]">
                <div
                  className="h-full rounded-full bg-[#D845DA] transition-[width] duration-75 ease-linear"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
