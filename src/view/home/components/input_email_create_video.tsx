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
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden text-white">
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
          className="
                w-full
                rounded-xl
                border
                border-white/15
                bg-white/30
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
          <p className="mt-2 text-sm text-green-500">✓ Email verified</p>
        )}
      </div>

      {/* Continue */}
      <div className="shrink-0">
        <button
          onClick={handleContinue}
          type="button"
          disabled={!isValidEmail}
          className={` w-full rounded-full
                px-6 py-3
                text-xl font-semibold text-white
                transition-all
                active:scale-[0.98]
                disabled:cursor-not-allowed
                disabled:bg-none
                disabled:bg-white/15
                disabled:text-white/60
                bg-[linear-gradient(90deg,#4A04D1_0%,#D434E0_40%,#F6AFBB_100%)]`}
        >
          CONTINUE
        </button>
      </div>
    </div>
  );
}
