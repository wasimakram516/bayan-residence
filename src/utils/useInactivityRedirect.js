"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function useInactivityRedirect(timeoutMs = 60 * 1000, redirectPath = "/") {
  const router = useRouter();

  useEffect(() => {
    let timer;

    const resetTimer = () => {
      console.log("Activity detected, resetting timer");
      
      clearTimeout(timer);
      timer = setTimeout(() => {
        router.push(redirectPath);
      }, timeoutMs);
    };

    // Events that count as activity
    const events = ["click", "mousemove", "keydown", "touchstart"];

    events.forEach((event) => window.addEventListener(event, resetTimer));

    resetTimer(); // start timer on mount

    return () => {
      clearTimeout(timer);
      events.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, [router, timeoutMs, redirectPath]);
}
