import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClosed: () => void;
  children: React.ReactNode;
  title?: string;
}

const backdropMotion = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

const containerMotion = {
  initial: { opacity: 0, y: 40, scale: 0.96 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 40, scale: 0.96 },
};

const Modal = ({ isOpen, onClosed, children, title }: ModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xl"
          role="dialog"
          aria-modal="true"
          aria-label={title ?? "Dialog"}
          onClick={onClosed}
          {...backdropMotion}
        >
          <motion.div
            className="relative w-full max-w-lg rounded-3xl border border-[var(--border-soft)]/70 bg-[var(--surface-0)]/95 p-6 text-[var(--text-primary)] shadow-[0_30px_120px_-60px_rgba(15,23,42,0.8)] backdrop-blur-xl transition-colors duration-500 dark:bg-[var(--surface-card)]/95"
            onClick={(event) => event.stopPropagation()}
            {...containerMotion}
            transition={{ duration: 0.28, ease: "easeOut" }}
          >
            <button
              type="button"
              onClick={onClosed}
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-soft)]/70 text-[var(--text-secondary)] transition hover:border-[var(--accent)]/60 hover:text-[var(--accent)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
              aria-label="Close modal"
            >
              <X className="h-4 w-4" />
            </button>

            {title && (
              <header className="mb-6 pr-10">
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h2>
                <p className="mt-1 text-sm text-[var(--text-muted)]">Complete the form to continue.</p>
              </header>
            )}

            <div className="max-h-[80vh] overflow-y-auto pr-2">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;

