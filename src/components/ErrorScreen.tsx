/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useLiveAPIContext } from '@/contexts/LiveAPIContext';
import React, { useEffect, useState } from 'react';

export interface ExtendedErrorType {
  code?: number;
  message?: string;
  status?: string;
}

export default function ErrorScreen() {
  const { client } = useLiveAPIContext();
  const [error, setError] = useState<{ message?: string } | null>(null);

  useEffect(() => {
    if (!client) return;

    function onError(error: ErrorEvent) {
      console.error(error);
      setError(error);
    }

    client.on('error', onError);

    return () => {
      client.off('error', onError);
    };
  }, [client]);

  const quotaErrorMessage =
    'Gemini Live API in AI Studio has a limited free quota each day. Come back tomorrow to continue.';

  let errorMessage = 'Something went wrong. Please try again.';
  let rawMessage: string | null = error?.message ?? null;
  let tryAgainOption = true;
  if (error?.message?.includes('RESOURCE_EXHAUSTED')) {
    errorMessage = quotaErrorMessage;
    rawMessage = null;
    tryAgainOption = false;
  }

  if (!error) {
    return <div className="hidden" />;
  }

  return (
    <div className="flex flex-col items-center justify-center h-dvh w-full bg-black text-white gap-12 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[99991]">
      <div className="text-5xl">:(</div>
      <div className="w-full text-center max-w-[650px] px-2 text-[22px] leading-tight opacity-50">
        {errorMessage}
      </div>
      {tryAgainOption ? (
        <button
          className="text-white text-2xl cursor-pointer"
          onClick={() => {
            setError(null);
          }}
        >
          Close
        </button>
      ) : null}
      {rawMessage ? (
        <div className="w-full text-center max-w-[650px] px-2 text-[15px] leading-tight opacity-40">
          {rawMessage}
        </div>
      ) : null}
    </div>
  );
}
