"use client";

import { useMemo, useState } from "react";

interface EmailViewProps {
  onComplete: (email: string) => void;
}

export default function EmailView({ onComplete }: EmailViewProps) {
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
    <div className="flex min-h-0 w-full flex-1 flex-col text-white">
      <div className="min-h-0 flex-1 overflow-y-auto">
      {/* Title */}
      <h1 className="text-2xl font-bold text-center">
        Enter your email to get your video
      </h1>
      <p className="mt-2 text-center text-sm text-white/50">
        Your information is 100% secure. Your privacy matters to us. By
        submitting your email, you’ll receive valuable content and helpful
        information from us.
      </p>
      {/* Form */}
      <div className="my-10">
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your Email"
          autoComplete="email"
          className="w-full rounded-xl border border-transparent bg-[#494949] px-4 py-3 text-base text-white placeholder:text-[#c7c2c7] focus:border-fuchsia-400 focus:outline-none"
        />

        {/* Verify email */}
        {email.length > 0 && !isValidEmail && (
          <p className="mt-2 text-sm text-red-400">
            Please enter a valid email address.
          </p>
        )}

        {isValidEmail && (
          <p className="mt-2 text-sm text-green-500">✓ Email verified</p>
        )}
      </div>

      </div>

      {/* Continue */}
      <div className="shrink-0 mt-auto">
        <button
          onClick={handleContinue}
          type="button"
          disabled={!isValidEmail}
          className="
                mt-4 min-h-[45px] w-full shrink-0 rounded-full
                px-2 py-2 text-lg font-semibold
                transition-all
                active:scale-[0.98]
                disabled:cursor-not-allowed
                disabled:bg-none
                disabled:bg-white/15
                disabled:text-white/60
                bg-[linear-gradient(92.95deg,_#4A04D1_-22.72%,_#D434E0_28.24%,_#F6AFBB_104.92%)]
              "
        >
          CONTINUE
        </button>
      </div>
    </div>
  );
}
