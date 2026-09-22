"use client";

import { motion, AnimatePresence } from "framer-motion";

export default function ReusableModal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  width = "max-w-md",
}) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 flex justify-center items-center z-50"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className={`bg-white rounded-xl p-6 shadow-xl w-full ${width}`}
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-black text-xl"
            >
              &times;
            </button>
          </div>

          {/* Body */}
          <div>{children}</div>

          {/* Footer */}
          {footer && <div className="mt-4">{footer}</div>}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}