import { useState, useCallback, useEffect } from "react";
import { X } from "lucide-react";

interface ModalWrapperProps {
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  zIndex?: number;
}

export default function ModalWrapper({ onClose, children, className = "", zIndex = 9999 }: ModalWrapperProps) {
  const [closing, setClosing] = useState(false);

  const handleClose = useCallback(() => {
    setClosing(true);
    setTimeout(() => {
      onClose();
    }, 150);
  }, [onClose]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [handleClose]);

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center bg-black/80 p-4 modal-overlay ${closing ? "closing" : ""}`}
      style={{ zIndex }}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className={`modal-content relative ${className}`}>
        <button
          data-testid="button-modal-close"
          onClick={handleClose}
          className="modal-close-btn"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
        {children}
      </div>
    </div>
  );
}

export { ModalWrapper };
export type { ModalWrapperProps };
