"use client";

import React, { useCallback, useEffect } from "react";
import { Download, Smartphone } from "lucide-react";

export type OpenMagicSwapButtonProps = {
  orderId?: string;
  type?: string;
  imageUrl?: string;
  modelId?: string;
  autoOpen?: boolean;
  showButton?: boolean;
  buttonText?: string;
  className?: string;
};

const SEE_VID_BUNDLE_ID = "com.bho.videoai";
const SEE_VID_APPLE_ID = "6788194400";
const SEE_VID_SCHEME = "seevid";
const FACEBOOK_PLAY_URL = "https://fb.gg/play/puzz_game";

const buildAndroidStoreUrl = (
  orderId?: string,
  type: string = "payment_web",
  modelId?: string,
) => {
  const baseUrl = `https://play.google.com/store/apps/details?id=${SEE_VID_BUNDLE_ID}`;
  const referrerParams = new URLSearchParams();
  if (orderId) {
    referrerParams.set("order_id", orderId);
  }
  referrerParams.set("type", type);
  if (modelId) {
    referrerParams.set("model_id", modelId);
  }
  return `${baseUrl}&referrer=${encodeURIComponent(referrerParams.toString())}`;
};

const buildIOSStoreUrl = () =>
  `https://apps.apple.com/app/id${SEE_VID_APPLE_ID}`;

const buildMagicSwapParams = (
  orderId?: string,
  type: string = "payment_web",
  imageUrl?: string,
  modelId?: string,
) => {
  const params = new URLSearchParams({
    id: SEE_VID_BUNDLE_ID,
    type,
  });

  if (orderId) {
    params.set("order_id", orderId);
  }

  if (imageUrl) {
    params.set("img", imageUrl);
  }

  if (modelId) {
    params.set("model_id", modelId);
  }

  return params;
};

const buildAndroidIntentLink = (
  orderId?: string,
  type: string = "payment_web",
  imageUrl?: string,
  modelId?: string,
) => {
  const params = buildMagicSwapParams(orderId, type, imageUrl, modelId);
  const storeUrl = buildAndroidStoreUrl(orderId, type, modelId);

  return `intent://open?${params.toString()}#Intent;scheme=${SEE_VID_SCHEME};package=${SEE_VID_BUNDLE_ID};S.browser_fallback_url=${encodeURIComponent(
    storeUrl,
  )};end`;
};

const buildIOSDeepLink = (
  orderId?: string,
  type: string = "payment_web",
  modelId?: string,
) => {
  const params = new URLSearchParams();

  if (orderId) {
    params.set("order_id", orderId);
  }

  params.set("type", type);

  if (modelId) {
    params.set("model_id", modelId);
  }

  const query = params.toString();
  return `${SEE_VID_SCHEME}://open${query ? `?${query}` : ""}`;
};

const getPlatform = () => {
  if (typeof navigator === "undefined") {
    return {
      isAndroid: false,
      isIOS: false,
    };
  }

  const ua = navigator.userAgent || "";
  const platform = navigator.platform || "";
  const isAndroid = /Android/i.test(ua);
  const isIPadOS =
    navigator.maxTouchPoints > 1 &&
    (/Mac/i.test(platform) || /Macintosh/i.test(ua));
  const isIOS =
    /iPhone|iPad|iPod/i.test(ua) ||
    isIPadOS ||
    (!isAndroid && /FBIOS|MessengerForiOS/i.test(ua));

  return {
    isAndroid,
    isIOS,
  };
};

const didPageHide = () =>
  document.hidden || document.visibilityState === "hidden";

export default function OpenMagicSwapButton({
  orderId,
  type = "payment_web",
  imageUrl,
  modelId,
  autoOpen = false,
  showButton = true,
  buttonText = "DOWNLOAD APP ĐỂ NHẬN RESULT",
  className,
}: OpenMagicSwapButtonProps) {
  const openApp = useCallback(() => {
    const { isAndroid, isIOS } = getPlatform();

    if (isIOS) {
      let appWasOpened = didPageHide();
      let fallbackTimer: number | undefined;

      const markAppAsOpened = () => {
        if (didPageHide()) {
          appWasOpened = true;
          if (fallbackTimer !== undefined) {
            window.clearTimeout(fallbackTimer);
          }
          document.removeEventListener("visibilitychange", markAppAsOpened);
          window.removeEventListener("pagehide", markAppAsOpened);
        }
      };

      document.addEventListener("visibilitychange", markAppAsOpened);
      window.addEventListener("pagehide", markAppAsOpened);

      window.location.href = buildIOSDeepLink(orderId, type, modelId);

      fallbackTimer = window.setTimeout(() => {
        document.removeEventListener("visibilitychange", markAppAsOpened);
        window.removeEventListener("pagehide", markAppAsOpened);

        if (!appWasOpened && !didPageHide()) {
          window.location.href = buildIOSStoreUrl();
        }
      }, 1800);
      return;
    }

    if (!isAndroid) {
      // Desktop fallback: Có thể chuyển hướng sang Google Play Store hoặc Web
      window.location.href = buildAndroidStoreUrl(orderId, type, modelId);
      return;
    }

    window.location.href = buildAndroidIntentLink(
      orderId,
      type,
      imageUrl,
      modelId,
    );

    window.setTimeout(() => {
      if (!didPageHide()) {
        window.location.href = buildAndroidStoreUrl(orderId, type, modelId);
      }
    }, 1800);
  }, [orderId, type, imageUrl, modelId]);

  useEffect(() => {
    if (!autoOpen) return;

    const timer = window.setTimeout(() => {
      openApp();
    }, 400);

    return () => {
      window.clearTimeout(timer);
    };
  }, [autoOpen, openApp]);

  if (!showButton) {
    return null;
  }

  const defaultButtonClass =
    "flex items-center justify-center text-[18px] gap-2 mt-[20px] bg-[linear-gradient(92.95deg,_#4A04D1_-22.72%,_#D434E0_28.24%,_#F6AFBB_104.92%)] w-full shrink-0 rounded-[150px] py-[10px] font-semibold text-white transition  hover:scale-[1.02]";

  return (
    <button
      type="button"
      onClick={openApp}
      className={className || defaultButtonClass}
    >
      <span>{buttonText}</span>
    </button>
  );
}
