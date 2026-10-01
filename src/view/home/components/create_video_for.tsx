"use client";

import { useState } from "react";

const options = ["Me", "Partner", "My parents", "My child", "Someone special"];

export default function WhoIsThisForView({onContinue}: {onContinue?: () => void}) {
  const [selected, setSelected] = useState<string | null>('Me');

  return (
    <div className="h-screen w-full overflow-hidden bg-black text-white">
      <div className="mx-auto flex h-screen w-full max-w-[430px] flex-col px-5">
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center">
          <div className="flex items-center gap-2">
           

            <span className="text-xl font-semibold tracking-tight">Seevid</span>
          </div>
        </header>

        {/* Content */}
        <main className="flex min-h-0 flex-1 flex-col">
          {/* Title */}
          <div className="pt-8 pb-6">
            <h1 className="text-3xl font-bold leading-tight">
              Who are you creating
              <br />
              this video for?
            </h1>

            <p className="mt-3 text-sm text-white/60">
              Choose the person this video is meant for.
            </p>
          </div>

          {/* Options */}
          <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pb-2">
            {options.map((option) => {
              const isSelected = selected === option;

              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => setSelected(option)}
                  className={`
                    flex w-full items-center justify-between
                    rounded-xl border px-5 py-4
                    text-left text-base font-medium
                    transition-all
                    ${
                      isSelected
                        ? "border-white bg-white text-black"
                        : "border-white/15 bg-white/5 text-white hover:border-white/30 hover:bg-white/10"
                    }
                  `}
                >
                  <span>{option}</span>

                  {/* Radio */}
                  <span
                    className={`
                      flex h-5 w-5 items-center justify-center
                      rounded-full border
                      ${isSelected ? "border-black" : "border-white/40"}
                    `}
                  >
                    {isSelected && (
                      <span className="h-2.5 w-2.5 rounded-full bg-black" />
                    )}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Continue */}
          <div className="mt-auto shrink-0 pb-6 pt-5">
            <button
            onClick={onContinue}
              type="button"
              disabled={!selected}
              className="
                w-full rounded-xl
                bg-white px-6 py-4
                text-base font-semibold text-black
                transition-all
                hover:bg-white/90
                active:scale-[0.98]
                disabled:cursor-not-allowed
                disabled:opacity-30
              "
            >
              Continue
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
