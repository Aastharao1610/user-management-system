"use client";
import React from "react";

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  limit,
  setLimit,
  options = [10, 50, 100, 200, "All"],
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
      {/* Limit selector */}
      <div className="flex items-center gap-2">
        <label className="text-sm text-gray-500">Rows per page:</label>
        <select
          value={limit}
          onChange={(e) => setLimit(e.target.value)}
          className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {options.map((opt, i) => (
            <option key={i} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 cursor-pointer border disabled:cursor-not-allowed rounded-md text-sm disabled:opacity-50"
        >
          Prev
        </button>

        <span className="text-sm text-gray-600">
          Page {currentPage} of {totalPages}
        </span>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 cursor-pointer disabled:cursor-not-allowed border rounded-md text-sm disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;
