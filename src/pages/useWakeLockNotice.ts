
import { useEffect } from "react";
import { toast } from "@/components/ui/use-toast";

/**
 * Hook that subscribes to wake lock state and shows a toast when the brewing process starts.
 * Optionally, on lock loss or unsupported browser, notifies user.
 */
export function useWakeLockNotice() {
  useEffect(() => {
    // Lazy: subscribe once, won't cause issues (all brewing triggers on start).
    if (typeof window === "undefined" || !window.setWhisperBrewOnWakeLockChange) return;
    window.setWhisperBrewOnWakeLockChange((state) => {
      if (state.acquired) {
        toast({
          title: "Screen awake",
          description:
            "Your screen will stay awake during brewing. Don't close the browser or lock your device!",
        });
      } else if (state.supported === false) {
        toast({
          title: "Screen may sleep",
          description:
            "Your browser does not support wake lock. Please keep your device active during brewing.",
          variant: "destructive",
        });
      } else if (state.acquired === false && state.supported === true) {
        toast({
          title: "Screen may sleep",
          description:
            "Your device can now go to sleep. Wake lock is disabled.",
        });
      }
    });
  }, []);
}
