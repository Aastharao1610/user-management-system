"use client";
import { motion, AnimatePresence } from "framer-motion";
import React from "react";

const DeleteReport = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
        onClick={onClose} // close when clicked outside
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-[90%] max-w-md shadow-xl"
          onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Delete Report?
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Are you sure you want to delete this Report? This action cannot be
            undone.
          </p>

          <div className="mt-5 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-white  text-sm font-medium bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 text-sm font-medium bg-red-600 hover:bg-red-700 text-white rounded-lg"
            >
              Delete
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DeleteReport;
