"use client";

import { useMemo, useState } from "react";

interface EmailViewProps {
  onComplete: (email: string) => void;
}

export default function EmailView({
  onComplete,
}: EmailViewProps) {
  const [email, setEmail] = useState("");

  const isValidEmail = useMemo(() => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  }, [email]);

  const handleContinue = () => {
    const value = email.trim();

    if (!isValidEmail) return;

    onComplete(value);
  };

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
          <div className="pt-8">
            <h1 className="text-3xl font-bold leading-tight">
              Enter your email
              <br />
              to get your video
            </h1>
          </div>

          {/* Form */}
          <div className="mt-10">
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium"
            >
              Email address
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              className="
                w-full
                rounded-xl
                border
                border-white/15
                bg-white/5
                px-4
                py-4
                text-base
                text-white
                outline-none
                placeholder:text-white/30
                transition
                focus:border-white/50
                focus:bg-white/10
              "
            />

            {/* Verify email */}
            {email.length > 0 && !isValidEmail && (
              <p className="mt-2 text-sm text-red-400">
                Please enter a valid email address.
              </p>
            )}

            {isValidEmail && (
              <p className="mt-2 text-sm text-white/50">
                ✓ Email verified
              </p>
            )}
          </div>

          {/* Privacy */}
          <p className="mt-6 text-xs leading-relaxed text-white/45">
            Your information is 100% secure. We don’t sell
            your personal information. By submitting your
            email, you’ll receive updates and everything we
            have for you.
          </p>

          {/* Continue */}
          <div className="mt-auto pb-6 pt-6">
            <button
              type="button"
              onClick={handleContinue}
              disabled={!isValidEmail}
              className="
                w-full
                rounded-xl
                bg-white
                px-6
                py-4
                text-base
                font-semibold
                text-black
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