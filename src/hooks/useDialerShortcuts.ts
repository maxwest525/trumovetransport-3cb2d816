import { useEffect } from "react";
import { DialerProvider } from "@/components/dialer/dialerProvider";

/**
 * Global keyboard shortcuts for the softphone.
 * Space = toggle mute, H = toggle hold, D = focus dialpad, N = next (power dialer)
 *
 * Only active when the user is NOT focused on an input/textarea/select/contenteditable.
 */
export function useDialerShortcuts(options?: {
  onToggleDialpad?: () => void;
  onNextContact?: () => void;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      const isEditable =
        tag === "input" ||
        tag === "textarea" ||
        tag === "select" ||
        (e.target as HTMLElement)?.isContentEditable;
      if (isEditable) return;

      const call = DialerProvider.getCurrentCall();

      switch (e.key.toLowerCase()) {
        case " ": // Space = toggle mute
          if (call && call.state === "active") {
            e.preventDefault();
            DialerProvider.mute(!call.isMuted);
          }
          break;
        case "h": // H = toggle hold
          if (call && (call.state === "active" || call.state === "on_hold")) {
            e.preventDefault();
            DialerProvider.hold(call.state !== "on_hold");
          }
          break;
        case "d": // D = toggle dialpad
          if (options?.onToggleDialpad) {
            e.preventDefault();
            options.onToggleDialpad();
          }
          break;
        case "n": // N = next contact (power dialer)
          if (options?.onNextContact) {
            e.preventDefault();
            options.onNextContact();
          }
          break;
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [options?.onToggleDialpad, options?.onNextContact]);
}
