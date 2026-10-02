import React, { useState } from "react";
import { useRouter } from "next/router";
import { MainLayout } from "@/layouts/MainLayout";
import Link from "next/link";
import { ROUTES } from "@/routers/routes";
import OpenMagicSwapButton from "@/components/OpenMagicSwapButton";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const listItems = [
    "Remember the email you used",
    "Click the button below to download the app",
    "Open the app and tap Setting -> Add Purchase",
    "Enter the email that you used for signing up",
  ];
  const { order_id, payment_intent, payment_intent_client_secret } =
    router.query;
  const [copiedOrderId, setCopiedOrderId] = useState<boolean>(false);

  const activeOrderId = (order_id as string) || "";
  const activeIntentId =
    (payment_intent as string) ||
    (payment_intent_client_secret as string) ||
    "";

  const handleCopyOrderId = () => {
    const idToCopy = activeOrderId || activeIntentId;
    if (idToCopy) {
      navigator.clipboard.writeText(idToCopy);
      setCopiedOrderId(true);
      setTimeout(() => setCopiedOrderId(false), 2000);
    }
  };

  return (
    <MainLayout>
      <div className="w-full bg-white h-screen flex flex-col items-center py-4 px-4 gap-4">
        <img
          src="/images/img_success.png"
          alt="Logo"
          className="h-[120px] w-auto shrink-0 object-contain"
        />
        <span className="items-center justify-center rounded-full text-[21px] font-bold text-black">
          Just one more step!
        </span>
        <div className="flex flex-col items-start gap-4">
          {listItems.map((item, index) => (
            <div
              className="w-full flex items-center py-3 px-4 bg-white rounded-full border border-[#DBDBDB]"
              key={index}
            >
              <div className="py-2 px-4 bg-[#AE2108] rounded-full text-white text-[15px]">
                {index}
              </div>
              <span className="ml-2 text-black text-[15px]">{item}</span>
            </div>
          ))}
        </div>
        <OpenMagicSwapButton
          orderId={activeOrderId}
          type="payment_web"
          buttonText="DOWNLOAD"
        />
          <div className="flex items-center justify-center gap-4 pt-4 border-t border-purple-500/20 text-xs">
            <Link
              href={ROUTES.HOME}
              className="text-slate-400 hover:text-white transition-colors py-2 px-3 rounded-lg hover:bg-slate-800"
            >
              Về Trang Chủ
            </Link>
          </div>
      </div>
    </MainLayout>
  );
}
