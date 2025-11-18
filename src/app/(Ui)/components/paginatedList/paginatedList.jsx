"use client";
import React, { useState, useEffect } from "react";
import Pagination from "../common/page";
import { Search } from "lucide-react";
import UserSkeleton from "../skeleton/UserSkeleton";

export default function PaginatedList({
  fetchData,
  columns = [],
  renderRow,
  themeClasses = {},
  createButton,
  actions,
  filters,
  dateFilter,
  pageSizeOptions = [10, 25, 50, "All"],
  showNumbering = true,
}) {
  const {
    border = "border-gray-200",
    accentColor = "text-indigo-600",
    inactiveText = "text-gray-500",
    text = "text-black",
    bg = "bg-white",
    hover = "hover:bg-gray-50",
  } = themeClasses;

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(pageSizeOptions[0]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [filterValues, setFilterValues] = useState({});

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchData({
        page,
        limit,
        search,
        filters: filterValues,
      });

      setData(res.data || []);
      setTotalPages(res.totalPages || 1);
      setTotalRecords(res.totalCount || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page, limit, search, filterValues]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between w-full flex-wrap gap-4">
        <div className="flex items-center">
          <div className="relative w-64">
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className={`w-full p-2 pl-10 rounded-lg border ${border} ${bg} ${text}`}
            />
            <Search
              className={`absolute left-3 top-1/2 -translate-y-1/2 ${inactiveText}`}
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Filters */}
          {filters && (
            <div className="flex items-center gap-3">
              {filters.map((filter) => (
                <select
                  key={filter.key}
                  className={`p-2 rounded-lg border ${border} ${bg} ${text}`}
                  onChange={(e) => {
                    setFilterValues({
                      ...filterValues,
                      [filter.key]: e.target.value,
                    });
                    setPage(1);
                  }}
                >
                  <option value="">Select </option>
                  {filter.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ))}
            </div>
          )}

          {/* Create Button (only shows when passed) */}
          {createButton && (
            <button className="bg-blue-700 px-12 py-3 rounded-md text-white cursor-pointer">
              {createButton}
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div
        className={`overflow-x-auto rounded-xl shadow-lg border ${border} ${bg}`}
      >
        <table className="min-w-full divide-y divide-gray-700">
          <thead className={bg}>
            <tr>
              {showNumbering && (
                <th className="px-4 py-3 text-left text-xs font-medium">#</th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`${
                    col.width || ""
                  }  px-4 py-3 text-left text-xs font-medium ${inactiveText}`}
                >
                  {col.label}
                </th>
              ))}
              {actions && <th className="px-4 py-3 text-right">Actions</th>}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-700">
            {loading ? (
              <tr>
                <td colSpan={columns.length + 2}>
                  <UserSkeleton />
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + 2}
                  className="text-center py-6 text-gray-400"
                >
                  No data found
                </td>
              </tr>
            ) : (
              data.map((item, index) => {
                const number =
                  limit === "All"
                    ? index + 1
                    : (page - 1) * Number(limit) + (index + 1);

                return (
                  <tr key={item.id} className={hover}>
                    {showNumbering && <td className="px-4 py-4">{number}</td>}

                    {renderRow(item, index)}

                    {/* Action Buttons */}
                    {actions && (
                      <td className="px-4 py-4 text-right flex justify-end gap-2">
                        {actions(item)}
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalRecords > 0 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          limit={limit}
          setLimit={setLimit}
          totalRecords={totalRecords}
        />
      )}
    </div>
  );
}
