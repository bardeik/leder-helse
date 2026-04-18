"use client";

import { createPortal } from "react-dom";

interface FloatingSaveNoticeProps {
  message: string;
}

export function FloatingSaveNotice({ message }: FloatingSaveNoticeProps) {
  if (!message || typeof window === "undefined") {
    return null;
  }

  return createPortal(
    <div className="floating-save-notice-viewport">
      <div className="floating-save-notice" aria-live="polite">
        {message}
      </div>
    </div>,
    document.body
  );
}
